// backend/src/services/FlashcardService.ts
// Service layer for flashcard operations

import { PrismaClient, Status } from '@prisma/client';
import AppError from '../utils/AppError';

const prisma = new PrismaClient();

export interface CreateFlashcardSetDto {
  set_name: string;
  description?: string;
  background_color?: string;
  icon?: string;
  width_size?: string;
  height_custom?: number;
  theme_tag?: string;
}

export interface UpdateFlashcardSetDto {
  set_name?: string;
  description?: string;
  background_color?: string;
  icon?: string;
  width_size?: string;
  height_custom?: number;
  theme_tag?: string;
}

export interface AddCardToSetDto {
  vocab_id: number;
  status?: Status;
}

class FlashcardService {
  /**
   * Lấy tất cả flashcard sets của user
   */
  async getUserFlashcardSets(userId: number) {
    const sets = await prisma.userFlashcardSets.findMany({
      where: { user_id: userId },
      include: {
        _count: {
          select: { user_flashcard_cards: true },
        },
      },
      orderBy: { created_at: 'desc' },
    });

    return sets.map((set) => ({
      ...set,
      card_count: set._count.user_flashcard_cards,
    }));
  }

  /**
   * Lấy chi tiết 1 flashcard set với cards
   */
  async getFlashcardSetById(setId: number, userId: number) {
    const set = await prisma.userFlashcardSets.findFirst({
      where: {
        id: setId,
        user_id: userId,
      },
      include: {
        user_flashcard_cards: {
          include: {
            vocab: {
              include: {
                theme: true,
                lesson: true,
              },
            },
          },
        },
      },
    });

    if (!set) {
      throw new AppError('Flashcard set not found', 404);
    }

    return {
      ...set,
      card_count: set.user_flashcard_cards.length,
      cards: set.user_flashcard_cards,
    };
  }

  /**
   * Tạo flashcard set mới
   */
  async createFlashcardSet(userId: number, data: CreateFlashcardSetDto) {
    const newSet = await prisma.userFlashcardSets.create({
      data: {
        user_id: userId,
        set_name: data.set_name,
        description: data.description,
        background_color: data.background_color || '#C8CC77',
        icon: data.icon,
        width_size: data.width_size || 'medium',
        height_custom: data.height_custom,
        theme_tag: data.theme_tag,
      },
      include: {
        _count: {
          select: { user_flashcard_cards: true },
        },
      },
    });

    return {
      ...newSet,
      card_count: newSet._count.user_flashcard_cards,
    };
  }

  /**
   * Update flashcard set
   */
  async updateFlashcardSet(setId: number, userId: number, data: UpdateFlashcardSetDto) {
    // Verify ownership
    const existingSet = await prisma.userFlashcardSets.findFirst({
      where: { id: setId, user_id: userId },
    });

    if (!existingSet) {
      throw new AppError('Flashcard set not found or unauthorized', 404);
    }

    const updatedSet = await prisma.userFlashcardSets.update({
      where: { id: setId },
      data: {
        ...data,
        updated_at: new Date(),
      },
      include: {
        _count: {
          select: { user_flashcard_cards: true },
        },
      },
    });

    return {
      ...updatedSet,
      card_count: updatedSet._count.user_flashcard_cards,
    };
  }

  /**
   * Xóa flashcard set
   */
  async deleteFlashcardSet(setId: number, userId: number) {
    // Verify ownership
    const existingSet = await prisma.userFlashcardSets.findFirst({
      where: { id: setId, user_id: userId },
    });

    if (!existingSet) {
      throw new AppError('Flashcard set not found or unauthorized', 404);
    }

    await prisma.userFlashcardSets.delete({
      where: { id: setId },
    });

    return { message: 'Flashcard set deleted successfully' };
  }

  /**
   * Thêm card vào set
   */
  async addCardToSet(setId: number, userId: number, data: AddCardToSetDto) {
    // Verify set ownership
    const set = await prisma.userFlashcardSets.findFirst({
      where: { id: setId, user_id: userId },
    });

    if (!set) {
      throw new AppError('Flashcard set not found or unauthorized', 404);
    }

    // Verify vocab exists
    const vocab = await prisma.vocab.findUnique({
      where: { id: data.vocab_id },
    });

    if (!vocab) {
      throw new AppError('Vocabulary not found', 404);
    }

    // Check if card already exists
    const existingCard = await prisma.userFlashcardCards.findUnique({
      where: {
        set_id_vocab_id: {
          set_id: setId,
          vocab_id: data.vocab_id,
        },
      },
    });

    if (existingCard) {
      throw new AppError('This vocabulary is already in the set', 400);
    }

    // Create card
    const newCard = await prisma.userFlashcardCards.create({
      data: {
        set_id: setId,
        vocab_id: data.vocab_id,
        status: data.status || 'new',
      },
      include: {
        vocab: true,
      },
    });

    return newCard;
  }

  /**
   * Xóa card khỏi set
   */
  async removeCardFromSet(setId: number, vocabId: number, userId: number) {
    // Verify set ownership
    const set = await prisma.userFlashcardSets.findFirst({
      where: { id: setId, user_id: userId },
    });

    if (!set) {
      throw new AppError('Flashcard set not found or unauthorized', 404);
    }

    // Delete card
    await prisma.userFlashcardCards.delete({
      where: {
        set_id_vocab_id: {
          set_id: setId,
          vocab_id: vocabId,
        },
      },
    });

    return { message: 'Card removed from set successfully' };
  }

  /**
   * Update card status (new, learned, review, mastered)
   */
  async updateCardStatus(setId: number, vocabId: number, userId: number, status: Status) {
    // Verify set ownership
    const set = await prisma.userFlashcardSets.findFirst({
      where: { id: setId, user_id: userId },
    });

    if (!set) {
      throw new AppError('Flashcard set not found or unauthorized', 404);
    }

    const updatedCard = await prisma.userFlashcardCards.update({
      where: {
        set_id_vocab_id: {
          set_id: setId,
          vocab_id: vocabId,
        },
      },
      data: { status },
      include: {
        vocab: true,
      },
    });

    return updatedCard;
  }

  /**
   * Update last studied timestamp
   */
  async updateStudyProgress(setId: number, userId: number) {
    // Verify ownership
    const set = await prisma.userFlashcardSets.findFirst({
      where: { id: setId, user_id: userId },
    });

    if (!set) {
      throw new AppError('Flashcard set not found or unauthorized', 404);
    }

    const updatedSet = await prisma.userFlashcardSets.update({
      where: { id: setId },
      data: { last_studied_at: new Date() },
    });

    return updatedSet;
  }

  /**
   * Get quiz for flashcard set (filter quizzes by theme_tag)
   */
  async getQuizForSet(setId: number, userId: number) {
    // Get set info
    const set = await prisma.userFlashcardSets.findFirst({
      where: { id: setId, user_id: userId },
    });

    if (!set) {
      throw new AppError('Flashcard set not found or unauthorized', 404);
    }

    // Find quizzes matching theme_tag with context = flashcard_set
    const quizzes = await prisma.quizzes.findMany({
      where: {
        context: 'flashcard_set',
        theme_tag: set.theme_tag,
      },
      orderBy: { completed_at: 'desc' },
      take: 10,
    });

    return {
      set_id: setId,
      set_name: set.set_name,
      theme_tag: set.theme_tag,
      quizzes,
    };
  }

  /**
   * Tạo flashcard set mặc định cho user mới
   * Sẽ tạo 1 set với 10 từ vựng phổ biến nhất
   */
  async createDefaultFlashcardSet(userId: number) {
    try {
      // 1. Tạo flashcard set
      const defaultSet = await prisma.userFlashcardSets.create({
        data: {
          user_id: userId,
          set_name: '🌟 Từ vựng thông dụng',
          description: 'Bộ từ vựng mặc định giúp bạn bắt đầu học tiếng Anh',
          background_color: '#FFC107',
          icon: '⭐',
          width_size: 'medium',
          theme_tag: 'Essential',
        },
      });

      // 2. Lấy 10 từ vựng phổ biến (từ các theme khác nhau)
      const commonVocabs = await prisma.vocab.findMany({
        where: {
          // Lấy từ các bài học đầu tiên (giả định là từ phổ biến)
          lesson: {
            order: {
              lte: 3, // Lấy từ 3 lesson đầu tiên
            },
          },
        },
        take: 10,
        orderBy: {
          id: 'asc',
        },
      });

      // 3. Thêm vocab vào set
      if (commonVocabs.length > 0) {
        const cards = commonVocabs.map((vocab) => ({
          set_id: defaultSet.id,
          vocab_id: vocab.id,
          status: 'new' as const,
        }));

        await prisma.userFlashcardCards.createMany({
          data: cards,
        });
      }

      return defaultSet;
    } catch (error) {
      console.error('Error creating default flashcard set:', error);
      // Không throw error để không block việc tạo user
      return null;
    }
  }

  /**
   * Tạo flashcard set mới từ danh sách các từ sai trong quiz
   * Sẽ tạo set và thêm tất cả các vocab vào set trong 1 transaction
   */
  async createFlashcardSetFromWrongAnswers(
    userId: number,
    data: {
      setName: string;
      description?: string;
      backgroundColor?: string;
      icon?: string;
      vocabIds: number[];
    }
  ) {
    if (!data.vocabIds || data.vocabIds.length === 0) {
      throw new AppError('Vocab IDs array is required and cannot be empty', 400);
    }

    // Verify tất cả vocab IDs tồn tại
    const vocabs = await prisma.vocab.findMany({
      where: {
        id: {
          in: data.vocabIds,
        },
      },
    });

    if (vocabs.length !== data.vocabIds.length) {
      throw new AppError('Some vocabulary IDs are invalid', 400);
    }

    // Sử dụng transaction để đảm bảo tính toàn vẹn dữ liệu
    const result = await prisma.$transaction(async (tx) => {
      // 1. Tạo flashcard set mới
      const newSet = await tx.userFlashcardSets.create({
        data: {
          user_id: userId,
          set_name: data.setName,
          description: data.description || 'Từ vựng cần ôn lại từ quiz',
          background_color: data.backgroundColor || '#EF4444',
          icon: data.icon || '📝',
          width_size: 'medium',
        },
      });

      // 2. Tạo tất cả cards cho set
      const cards = data.vocabIds.map((vocabId) => ({
        set_id: newSet.id,
        vocab_id: vocabId,
        status: 'new' as Status,
      }));

      await tx.userFlashcardCards.createMany({
        data: cards,
      });

      // 3. Lấy lại set với card count
      const setWithCards = await tx.userFlashcardSets.findUnique({
        where: { id: newSet.id },
        include: {
          _count: {
            select: { user_flashcard_cards: true },
          },
        },
      });

      return {
        ...setWithCards,
        card_count: setWithCards?._count.user_flashcard_cards || 0,
      };
    });

    return result;
  }
}

export default new FlashcardService();
