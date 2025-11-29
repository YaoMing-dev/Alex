# ai-service/llm_processor.py
import torch
from transformers import AutoModelForCausalLM, AutoTokenizer, BitsAndBytesConfig
import json
import re

# Cấu hình mô hình
MODEL_NAME = "mistralai/Mistral-7B-Instruct-v0.2"
# Thiết bị: Ưu tiên CUDA (GPU), nếu không có thì dùng CPU
DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# --- Hàm Tải Mô hình (Chỉ chạy một lần khi Server khởi động) ---
def load_llm_model():
    print(f"Loading model on device: {DEVICE}")
    try:
        tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
        
        # Cấu hình lượng tử hóa (Quantization) 4-bit để giảm VRAM usage
        bnb_config = BitsAndBytesConfig(
            load_in_4bit=True,
            bnb_4bit_quant_type="nf4", 
            bnb_4bit_compute_dtype=torch.float16,
            bnb_4bit_use_double_quant=False,
        )

        model = AutoModelForCausalLM.from_pretrained(
            MODEL_NAME,
            quantization_config=bnb_config if DEVICE.type == 'cuda' else None,
            torch_dtype=torch.float16,
            device_map="auto"
        )
        
        if DEVICE.type == 'cpu' or not bnb_config.load_in_4bit:
            # Chuyển sang Float16 để tiết kiệm bộ nhớ (nếu không dùng 4bit)
            model.to(DEVICE).half() 

        return tokenizer, model

    except Exception as e:
        print(f"FATAL ERROR: Could not load LLM model. Check CUDA/VRAM: {e}")
        return None, None

# Tải mô hình toàn cục
LLM_TOKENIZER, LLM_MODEL = load_llm_model()

# Cấu trúc JSON mục tiêu
JSON_SCHEMA_HINT = """
{
  "band_score": float,
  "overall_analysis": {
    "TaskAchievement": float, 
    "CoherenceAndCohesion": float,
    "LexicalResource": float,
    "GrammaticalRangeAndAccuracy": float,
    "summary": "string"
  },
  "grammar_errors": [
    {
      "original_text": "string",
      "corrected_text": "string",
      "error_type": "string",
      "explanation_en": "string",
      "explanation_vn": "string", 
      "mapped_type": "string (must be one of: Grammar, Vocabulary, Style, Punctuation)", 
      "start_index": "int (character index in the essay, starting at 0)", 
      "end_index": "int (character index in the essay)"
    }
  ],
  "paraphrasing_suggestions": {
    "original_sentence": "string",
    "suggestion": "string"
  }
}
"""

def generate_prompt(topic_text: str, content: str, topic_type: str, sample_answer: str = None) -> str:
    """Tạo System Prompt cho Mistral 7B, hỗ trợ Task 1/Task 2, sử dụng sample_answer cho Task 1."""
    
    # 1. Định nghĩa Tiêu chí & Loại Task
    if topic_type == 'Task1':
        # Task 1: Tiêu chí đầu tiên là Task Achievement
        CRITERIA = "Task Achievement, Coherence and Cohesion, Lexical Resource, Grammatical Range and Accuracy."
        TASK_GOAL = "analyze the provided data/graph description and report the main features, and provide a comprehensive band score based on Task 1 requirements (reporting, summarizing, and describing data)."
        TASK_HINT = "Remember, Task 1 focuses on accurately reporting and summarizing the data, not stating opinions or arguments."
        # Tên tiêu chí Task 1 (để hiển thị cho LLM)
        FIRST_CRITERION_NAME = "Task Achievement"
        
    else: # Task 2
        # Task 2: Tiêu chí đầu tiên là Task Response
        CRITERIA = "Task Response, Coherence and Cohesion, Lexical Resource, Grammatical Range and Accuracy."
        TASK_GOAL = "analyze the user's argument and thesis, and provide a comprehensive band score based on Task 2 requirements (argument development, position, and support)."
        TASK_HINT = "Remember, Task 2 focuses on addressing all parts of the question and developing a clear, well-supported argument."
        # Tên tiêu chí Task 2 (để hiển thị cho LLM)
        FIRST_CRITERION_NAME = "Task Response"

    # 2. Định nghĩa SYSTEM_PROMPT
    SYSTEM_PROMPT = f"""You are an expert IELTS Writing Examiner specializing in **{topic_type}**. Your task is to {TASK_GOAL}

You MUST output a single, valid JSON object. DO NOT include any text outside the JSON object.

The analysis MUST cover the four official IELTS criteria: **{CRITERIA}**. 
CRITICAL: All band scores (overall_score and individual criterion scores) MUST be between 1.0 and 9.0. They must only be integers or half-integers (e.g., 6.0, 6.5, 7.0, 7.5). Scores like 9.5 or 7.2 are invalid.

{TASK_HINT}

**CRITICAL INSTRUCTIONS FOR overall_analysis:**
1. The first criterion score, whether **'{FIRST_CRITERION_NAME}'** (Task 1) or **'{FIRST_CRITERION_NAME}'** (Task 2), MUST use the JSON key **TaskAchievement** for schema compatibility.
2. Ensure the score for this criterion reflects the degree of achievement of the task (Task 1) or response to the task (Task 2).

---
**CRITICAL INSTRUCTIONS FOR grammar_errors ARRAY:**
1. This array MUST be filled with **at least 5 relevant errors** from the user's essay, unless fewer than 5 errors exist. You MUST identify grammar, vocabulary, and style errors.
2. For every error found, you MUST determine its character position in the ESSAY CONTENT (the 'content' variable).
3. Provide the **start_index** and **end_index** of the error in the original essay content (counting from 0). This is essential for highlighting in the frontend.
4. The **mapped_type** MUST be one of the following four categories: **Grammar**, **Vocabulary**, **Style**, or **Punctuation**.

---
**CRITICAL INSTRUCTIONS FOR paraphrasing_suggestions:**
1. You MUST select **one complex or repetitive sentence** from the user's essay.
2. Fill the `original_sentence` and provide a better, more advanced alternative in `suggestion` to improve Lexical Resource score.
---

The JSON structure MUST strictly adhere to this schema:
{JSON_SCHEMA_HINT}
"""
    
    # Kết hợp topic_text và sample_answer (nếu là Task 1)
    if topic_type == 'Task 1' and sample_answer:
        USER_MESSAGE = f"The Task Type is: {topic_type}\n\nHere is the Task Instructions:\n---\n{topic_text}\n---\n\nHere is the Sample Answer (data description):\n---\n{sample_answer}\n---\n\nHere is the user's essay:\n---\n{content}\n---"
    else:
        USER_MESSAGE = f"The Task Type is: {topic_type}\n\nHere is the Topic to be addressed:\n---\n{topic_text}\n---\n\nHere is the user's essay:\n---\n{content}\n---"
    
    # Kết hợp thành định dạng Mistral Instruct
    prompt = f"<s>[INST] <<SYS>>\n{SYSTEM_PROMPT}\n<</SYS>>\n\n{USER_MESSAGE} [/INST]"
    return prompt

# --- Hàm Xử lý Chính ---
def process_with_llm(topic_text: str, content: str, topic_type: str, sample_answer: str = None) -> dict:
    """
    Sử dụng Mistral-7B để chấm điểm và phân tích, dùng sample_answer thay cho mô tả hình ảnh nếu là Task 1.
    """
    if LLM_MODEL is None:
        raise Exception("LLM Model not loaded.")

    # Tạo prompt với topic_text và sample_answer (nếu có)
    prompt = generate_prompt(topic_text, content, topic_type, sample_answer)
    
    # 1. Mã hóa prompt
    inputs = LLM_TOKENIZER(prompt, return_tensors="pt").to(DEVICE)
    
    # 2. Cấu hình sinh văn bản
    with torch.no_grad():
        output_tokens = LLM_MODEL.generate(
            **inputs, 
            max_new_tokens=2048, 
            do_sample=False, 
            temperature=0.0,
            pad_token_id=LLM_TOKENIZER.eos_token_id 
        )
    
    # 3. Giải mã và làm sạch đầu ra
    raw_output = LLM_TOKENIZER.decode(output_tokens[0], skip_special_tokens=True)
    
    try:
        response_start_index = raw_output.rfind("[/INST]")
        if response_start_index != -1:
            clean_output = raw_output[response_start_index + len("[/INST]"):].strip()
        else:
            clean_output = raw_output.strip()
            
        # 1. Tìm vị trí dấu '{' đầu tiên
        json_start = clean_output.find('{')
        if json_start == -1:
             raise Exception("AI failed to return any starting '{' for JSON.")

        # 2. Tìm vị trí dấu '}' cuối cùng
        # Tìm dấu '}' cuối cùng từ vị trí bắt đầu
        json_end = clean_output.rfind('}')
        if json_end == -1 or json_end < json_start:
            raise Exception("AI failed to return any closing '}' for JSON.")
            
        # 3. Cắt chuỗi chỉ giữ lại phần JSON
        json_string = clean_output[json_start : json_end + 1].strip()
        
        # 4. Loại bỏ các dấu ` (markdown block) nếu còn sót lại
        json_string = json_string.strip('`').strip()
        
        # 5. Xử lý lỗi phẩy thừa cuối cùng (Mistral đôi khi thêm phẩy)
        json_string_clean = re.sub(r',\s*([\]}])', r'\1', json_string)
        
        result = json.loads(json_string_clean)
        
        # Validate JSON schema
        required_keys = ["band_score", "overall_analysis", "grammar_errors", "paraphrasing_suggestions"]
        if not all(key in result for key in required_keys):
            raise ValueError(f"Invalid JSON schema: missing required keys. Got: {list(result.keys())}")
        return result
        
    except json.JSONDecodeError as e:
        print(f"JSON Decoding Error: {e}")
        print(f"Raw output causing error: {raw_output}")
        raise Exception("AI failed to return valid JSON format.")
    except Exception as e:
        raise e