// frontend/src/lib/api/writing.ts
import { WritingTopic, mapBackendTopicToWritingTopic, WritingTopicsResponse } from '../types/writing';

// Sử dụng biến môi trường cho BASE_URL
const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL + '/api/writing';

/**
 * Lấy danh sách topic từ API với phân trang
 * @param type Loại task (Task1/Task2)
 * @param level Cấp độ (Beginner/Intermediate/Advanced)
 * @param limit Số lượng bản ghi (Mới)
 * @param offset Số lượng bản ghi bỏ qua (Mới)
 */
export const fetchWritingTopics = async (
    type?: string,
    level?: string,
    limit?: number,
    offset?: number,
    sort?: string,
    searchQuery?: string
): Promise<WritingTopicsResponse> => { // <--- THAY ĐỔI RETURN TYPE
    try {
        const query = new URLSearchParams();
        if (type) query.append('type', type);
        if (level) query.append('level', level);
        if (limit) query.append('limit', limit.toString());
        if (offset) query.append('offset', offset.toString());
        if (sort) query.append('sort', sort);
        if (searchQuery) query.append('searchQuery', searchQuery);

        const response = await fetch(`${API_BASE_URL}/topics?${query.toString()}`, {
            credentials: 'include',
        });

        if (!response.ok) {
            // Nếu lỗi 401 hoặc 403, lỗi này sẽ được xử lý lại bởi AuthContext (nếu token hết hạn) 
            // nhưng tạm thời ta throw error
            throw new Error(`Failed to fetch topics: ${response.status}`);
        }

        const result = await response.json();
        console.log('Topics response:', result); // Debug

        // Map từng topic và trả về cấu trúc mới
        return {
            ...result,
            topics: result.topics.map(mapBackendTopicToWritingTopic),
        };

    } catch (error) {
        console.error('Error fetching writing topics:', error);
        throw error;
    }
};

/**
 * Lấy topic theo id
 * @param id ID của topic (string, sẽ parse thành number cho backend)
 */
export const fetchWritingTopicById = async (id: string): Promise<WritingTopic> => {
    try {
        const numericId = parseInt(id, 10);
        if (isNaN(numericId)) {
            throw new Error('Invalid topic ID');
        }
        const response = await fetch(`${API_BASE_URL}/topics/${numericId}`, {
            credentials: 'include',
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch topic ${id}: ${response.status}`);
        }

        const data = await response.json();
        console.log('Topic by ID response:', data); // Debug

        if (!data) {
            throw new Error(`Topic with id ${id} not found`);
        }

        return mapBackendTopicToWritingTopic(data);
    } catch (error) {
        console.error('Error fetching writing topic by id:', error);
        throw error;
    }
};

/**
 * Lấy số lượng bài nộp của người dùng cho một topic
 * @param userId ID của người dùng
 * @param topicId ID của topic
 */
export const fetchSubmissionCount = async (userId: number, topicId: number): Promise<number> => {
    try {
        const response = await fetch(`${API_BASE_URL}/history?userId=${userId}`, {
            credentials: 'include',
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch submission history: ${response.status}`);
        }

        const history = await response.json();
        console.log('Submission history response:', history); // Debug
        return history.filter((submission: any) => submission.topics && submission.topics.id === topicId).length;
    } catch (error) {
        console.error('Error fetching submission count:', error);
        return 0; // Fallback nếu lỗi
    }
};