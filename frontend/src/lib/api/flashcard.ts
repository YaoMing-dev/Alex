// frontend/src/lib/api/flashcard.ts
// API service functions for flashcard endpoints

import axiosInstance from './axiosInstance';
import {
  FlashcardSet,
  FlashcardSetWithCards,
  CreateFlashcardSetDto,
  UpdateFlashcardSetDto,
  AddCardToSetDto,
  UpdateCardStatusDto,
  FlashcardCard,
  QuizForSet,
  FlashcardApiResponse,
} from '../types/flashcard';

const FLASHCARD_BASE_URL = '/api/flashcards';

/**
 * Lấy tất cả flashcard sets của user
 */
export const fetchUserFlashcardSets = async (): Promise<FlashcardSet[]> => {
  const response = await axiosInstance.get<FlashcardApiResponse<FlashcardSet[]>>(
    `${FLASHCARD_BASE_URL}/sets`
  );
  return response.data.data;
};

/**
 * Lấy chi tiết 1 flashcard set với cards
 */
export const fetchFlashcardSetById = async (setId: number): Promise<FlashcardSetWithCards> => {
  const response = await axiosInstance.get<FlashcardApiResponse<FlashcardSetWithCards>>(
    `${FLASHCARD_BASE_URL}/sets/${setId}`
  );
  return response.data.data;
};

/**
 * Tạo flashcard set mới
 */
export const createFlashcardSet = async (data: CreateFlashcardSetDto): Promise<FlashcardSet> => {
  const response = await axiosInstance.post<FlashcardApiResponse<FlashcardSet>>(
    `${FLASHCARD_BASE_URL}/sets`,
    data
  );
  return response.data.data;
};

/**
 * Update flashcard set
 */
export const updateFlashcardSet = async (
  setId: number,
  data: UpdateFlashcardSetDto
): Promise<FlashcardSet> => {
  const response = await axiosInstance.put<FlashcardApiResponse<FlashcardSet>>(
    `${FLASHCARD_BASE_URL}/sets/${setId}`,
    data
  );
  return response.data.data;
};

/**
 * Xóa flashcard set
 */
export const deleteFlashcardSet = async (setId: number): Promise<void> => {
  await axiosInstance.delete(`${FLASHCARD_BASE_URL}/sets/${setId}`);
};

/**
 * Thêm card vào set
 */
export const addCardToSet = async (
  setId: number,
  data: AddCardToSetDto
): Promise<FlashcardCard> => {
  const response = await axiosInstance.post<FlashcardApiResponse<FlashcardCard>>(
    `${FLASHCARD_BASE_URL}/sets/${setId}/cards`,
    data
  );
  return response.data.data;
};

/**
 * Xóa card khỏi set
 */
export const removeCardFromSet = async (setId: number, vocabId: number): Promise<void> => {
  await axiosInstance.delete(`${FLASHCARD_BASE_URL}/sets/${setId}/cards/${vocabId}`);
};

/**
 * Update card status
 */
export const updateCardStatus = async (
  setId: number,
  vocabId: number,
  data: UpdateCardStatusDto
): Promise<FlashcardCard> => {
  const response = await axiosInstance.put<FlashcardApiResponse<FlashcardCard>>(
    `${FLASHCARD_BASE_URL}/sets/${setId}/cards/${vocabId}`,
    data
  );
  return response.data.data;
};

/**
 * Update study progress (last_studied_at)
 */
export const updateStudyProgress = async (setId: number): Promise<FlashcardSet> => {
  const response = await axiosInstance.put<FlashcardApiResponse<FlashcardSet>>(
    `${FLASHCARD_BASE_URL}/sets/${setId}/study`
  );
  return response.data.data;
};

/**
 * Get quiz for flashcard set
 */
export const getQuizForSet = async (setId: number): Promise<QuizForSet> => {
  const response = await axiosInstance.get<FlashcardApiResponse<QuizForSet>>(
    `${FLASHCARD_BASE_URL}/sets/${setId}/quiz`
  );
  return response.data.data;
};

/**
 * Tạo flashcard set mới từ danh sách các từ sai trong quiz
 */
export const createFlashcardSetFromWrongAnswers = async (data: {
  setName: string;
  description?: string;
  backgroundColor?: string;
  icon?: string;
  vocabIds: number[];
}): Promise<FlashcardSet> => {
  const response = await axiosInstance.post<FlashcardApiResponse<FlashcardSet>>(
    `${FLASHCARD_BASE_URL}/create-from-wrong-answers`,
    data
  );
  return response.data.data;
};
