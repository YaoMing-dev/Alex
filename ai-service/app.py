# ai-service/app.py

import os
import threading
from dotenv import load_dotenv
from flask import Flask, request, jsonify
from llm_processor import process_with_llm # Import hàm xử lý LLM
import psycopg2
from datetime import datetime
import json
import requests

# Tải biến môi trường
load_dotenv()

# --- Cấu hình Database và App ---
DB_URL = os.getenv("DATABASE_URL")
if not DB_URL:
    raise Exception("DATABASE_URL not found in environment variables.")

# Lấy URL của Stats Service
STATS_SERVICE_URL = os.getenv("STATS_SERVICE_URL")
if not STATS_SERVICE_URL:
    print("WARNING: STATS_SERVICE_URL is not set. Stats update will be skipped.")

app = Flask(__name__)
# Trạng thái DB (đồng bộ với Enum trong Prisma)
COMPLETED_STATUS = "COMPLETED" 
ERROR_STATUS = "ERROR"

# --- Hàm cập nhật Database (Dùng lại logic đã định nghĩa) ---
def update_submission_status(submission_id, status, grading_result=None):
    # Sử dụng logic được định nghĩa trong P3.2
    
    try:
        conn = psycopg2.connect(DB_URL)
        cursor = conn.cursor()
        
        if status == COMPLETED_STATUS and grading_result:
            # Lấy dữ liệu từ kết quả LLM
            overall_json = json.dumps(grading_result.get("overall_analysis"))
            grammar_json = json.dumps(grading_result.get("grammar_errors"))
            band_score = grading_result.get("band_score")
            raw_ai_response = json.dumps(grading_result)
            
            query = """
                UPDATE "WritingSubmissions"
                SET status = %s, processed_at = %s, band_score = %s, 
                    overall_feedback_json = %s, grammar_feedback_json = %s, raw_ai_response = %s
                WHERE id = %s
                RETURNING "user_id", "topic_id";
            """
            params = (COMPLETED_STATUS, datetime.now(), band_score, overall_json, grammar_json, raw_ai_response, submission_id)

            cursor.execute(query, params)
            # Lấy user_id và topic_id từ kết quả UPDATE
            result = cursor.fetchone()

            # Lấy user_id và topic_id từ DB (Cần kiểm tra result)
            if result:
                user_id = result[0]
                topic_id = result[1]
            else:
                # Nếu UPDATE không tìm thấy bản ghi nào (rất hiếm, nhưng cần phòng ngừa)
                print(f"CRITICAL DB UPDATE ERROR: Submission {submission_id} not found for update.")
                return False, None, None
        else:
            # Trường hợp ERROR
            query = """
                UPDATE "WritingSubmissions"
                SET status = %s, processed_at = %s
                WHERE id = %s;
            """
            params = (ERROR_STATUS, datetime.now(), submission_id)
            cursor.execute(query, params)
            user_id = None
            topic_id = None # Không cần thiết nếu là ERROR

        cursor.execute(query, params)
        conn.commit()
        cursor.close()
        conn.close()
        print(f"DB update successful for submission {submission_id} with status {status}.")
        return True, user_id, topic_id
        
    except Exception as e:
        print(f"CRITICAL DB UPDATE ERROR for submission {submission_id}: {e}")
        return False, None, None
# --- End Hàm cập nhật Database ---

# --- Logic gọi Stats Service ---
def call_stats_service(userId, topicId, submissionId, bandScore, topicType):
    """Gửi HTTP POST request để kích hoạt StatsUpdaterService."""
    if not STATS_SERVICE_URL:
        return
        
    # Chuẩn bị payload (chỉ cần các thông tin thiết yếu)
    payload = {
        "userId": userId,
        "topicId": topicId,
        "submissionId": submissionId,
        "bandScore": bandScore,
        "topicType": topicType
    }
    
    # Thực hiện HTTP POST call
    try:
        # Sử dụng timeout để tránh chặn quá lâu nếu Stats Service gặp vấn đề
        response = requests.post(f"{STATS_SERVICE_URL}/update-stats", json=payload, timeout=10)
        response.raise_for_status() # Raise HTTPError cho trạng thái 4xx/5xx
        print(f"Stats Update dispatched successfully for submission {submissionId}. Response: {response.status_code}")
    except requests.exceptions.RequestException as e:
        print(f"WARNING: Failed to call StatsUpdaterService for submission {submissionId}: {e}")
        # Lỗi này không cần cập nhật trạng thái ERROR cho Submission, 
        # vì bài viết đã được chấm điểm thành công và lưu vào DB.
# --- End Logic gọi Stats Service ---

# --- Job Background ---
def grade_submission_job(submission_id, content, topic_type, sample_answer, topic_text, user_id, topic_id):
    """Luồng xử lý chính trong background."""
    print(f"Starting grading job for submission {submission_id}...")

    # Khởi tạo mặc định
    is_db_update_success = False

    try:
        # 1. Gọi LLM để chấm điểm
        grading_result = process_with_llm(
            topic_text=topic_text,
            content=content, 
            topic_type=topic_type, 
            sample_answer=sample_answer,
        )
        
        # 2. Cập nhật bản ghi là COMPLETED
        success, db_userId, db_topicId = update_submission_status(submission_id, COMPLETED_STATUS, grading_result)

        if success:
            is_db_update_success = True
            band_score = grading_result.get("band_score")
            
            # 3. KÍCH HOẠT STATS UPDATER (NON-BLOCKING)
            # Dùng user_id và topic_id lấy từ DB update (để đảm bảo không bị lỗi do truyền thiếu)
            if db_userId and band_score:
                # Kích hoạt Stats Service trong một luồng mới, không chặn luồng chấm điểm AI
                threading.Thread(
                    target=call_stats_service, 
                    args=(db_userId, db_topicId, submission_id, band_score, topic_type)
                ).start()

    except Exception as e:
        # 4. Nếu có lỗi xảy ra trong quá trình AI (LLM failed, JSON failed, etc.)
        print(f"AI Grading failed for submission {submission_id}: {e}")
        # Nếu DB chưa được cập nhật thành công (ví dụ: LLM fail trước), thì cập nhật thành ERROR
        if not is_db_update_success:
            update_submission_status(submission_id, ERROR_STATUS)
        

# --- Endpoint HTTP ---
@app.route('/grade', methods=['POST'])
def handle_grade_request():
    data = request.get_json()
    submission_id = data.get('submission_id')
    content = data.get('content')
    topic_type = data.get('topic_type')
    sample_answer = data.get('sample_answer')
    topic_text = data.get('topic_text')
    user_id = data.get('user_id')
    topic_id = data.get('topic_id')

    if not submission_id or not content or not topic_type or not topic_text or not user_id or not topic_id:
        return jsonify({"message": "Missing required fields (submission_id, content, topic_type, topic_text, user_id, topic_id)"}), 400
    
    # KÍCH HOẠT TIẾN TRÌNH BACKGROUND (Non-blocking)
    threading.Thread(
        target=grade_submission_job, 
        args=(submission_id, content, topic_type, sample_answer, topic_text, user_id, topic_id) 
    ).start()
    
    return jsonify({"message": f"Grading job initiated for submission {submission_id}"}), 200

# Khởi động app
if __name__ == '__main__':
    port = int(os.environ.get("AI_SERVICE_PORT", 5000))
    # Flask chạy ở chế độ threaded để xử lý nhiều yêu cầu đồng thời
    app.run(host='0.0.0.0', port=port, threaded=True)