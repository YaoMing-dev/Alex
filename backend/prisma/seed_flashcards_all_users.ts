// backend/prisma/seed_flashcards_all_users.ts
// Seed flashcard sets for ALL users in database

import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const prisma = new PrismaClient();

// 20 flashcard sets configuration
const FLASHCARD_SETS = [
  {
    set_name: 'Art and Culture',
    description: 'Essential vocabulary for art galleries, museums, and cultural events',
    background_color: '#E8D68A',
    icon: '🎨',
    width_size: 'large',
    height_custom: 300,
    theme_tag: 'Art',
  },
  {
    set_name: 'Animals - Pets',
    description: 'Common pets and domestic animals vocabulary',
    background_color: '#2C4356',
    icon: '🐾',
    width_size: 'small',
    height_custom: 145,
    theme_tag: 'Animals',
  },
  {
    set_name: 'Emotions & Personality',
    description: 'Express feelings and describe character traits',
    background_color: '#A5BFB0',
    icon: '😊',
    width_size: 'medium',
    height_custom: 200,
    theme_tag: 'Emotions',
  },
  {
    set_name: 'Accommodation & Hotels',
    description: 'Vocabulary for booking hotels and describing living spaces',
    background_color: '#C8CC77',
    icon: '🏨',
    width_size: 'small',
    height_custom: 145,
    theme_tag: 'Travel',
  },
  {
    set_name: 'Education & Learning',
    description: 'Academic vocabulary and educational terms',
    background_color: '#D4D18F',
    icon: '📚',
    width_size: 'large',
    height_custom: 300,
    theme_tag: 'Education',
  },
  {
    set_name: 'Animals - Farm',
    description: 'Farm animals and agricultural vocabulary',
    background_color: '#2C4356',
    icon: '🐄',
    width_size: 'medium',
    height_custom: 200,
    theme_tag: 'Animals',
  },
  {
    set_name: 'Electronics',
    description: 'Modern gadgets and electronic devices',
    background_color: '#8FB5B0',
    icon: '💻',
    width_size: 'medium',
    height_custom: 200,
    theme_tag: 'Technology',
  },
  {
    set_name: 'Food & Cooking',
    description: 'Kitchen vocabulary and cooking methods',
    background_color: '#E8D68A',
    icon: '🍳',
    width_size: 'medium',
    height_custom: 220,
    theme_tag: 'Food',
  },
  {
    set_name: 'Transportation',
    description: 'Vehicles and travel methods',
    background_color: '#4CAF50',
    icon: '🚗',
    width_size: 'small',
    height_custom: 150,
    theme_tag: 'Travel',
  },
  {
    set_name: 'Weather & Nature',
    description: 'Climate conditions and natural phenomena',
    background_color: '#87CEEB',
    icon: '🌤️',
    width_size: 'large',
    height_custom: 280,
    theme_tag: 'Nature',
  },
  {
    set_name: 'Health & Medicine',
    description: 'Medical terms and health-related vocabulary',
    background_color: '#FFB6C1',
    icon: '⚕️',
    width_size: 'medium',
    height_custom: 190,
    theme_tag: 'Health',
  },
  {
    set_name: 'Business & Work',
    description: 'Professional terminology and workplace vocabulary',
    background_color: '#D4AF37',
    icon: '💼',
    width_size: 'large',
    height_custom: 260,
    theme_tag: 'Work',
  },
  {
    set_name: 'Sports & Fitness',
    description: 'Athletic activities and exercise vocabulary',
    background_color: '#FF6347',
    icon: '⚽',
    width_size: 'small',
    height_custom: 160,
    theme_tag: 'Sports',
  },
  {
    set_name: 'Music & Entertainment',
    description: 'Musical instruments and entertainment industry',
    background_color: '#9370DB',
    icon: '🎵',
    width_size: 'medium',
    height_custom: 210,
    theme_tag: 'Entertainment',
  },
  {
    set_name: 'Shopping & Fashion',
    description: 'Clothing, accessories, and shopping vocabulary',
    background_color: '#FF69B4',
    icon: '👗',
    width_size: 'medium',
    height_custom: 195,
    theme_tag: 'Fashion',
  },
  {
    set_name: 'Technology & Internet',
    description: 'Digital world and online terminology',
    background_color: '#4169E1',
    icon: '🌐',
    width_size: 'large',
    height_custom: 270,
    theme_tag: 'Technology',
  },
  {
    set_name: 'Family & Relationships',
    description: 'Family members and relationship terms',
    background_color: '#FFA07A',
    icon: '👨‍👩‍👧‍👦',
    width_size: 'small',
    height_custom: 155,
    theme_tag: 'Family',
  },
  {
    set_name: 'Time & Dates',
    description: 'Temporal expressions and calendar vocabulary',
    background_color: '#20B2AA',
    icon: '⏰',
    width_size: 'medium',
    height_custom: 185,
    theme_tag: 'Time',
  },
  {
    set_name: 'Home & Furniture',
    description: 'Household items and interior design',
    background_color: '#DEB887',
    icon: '🛋️',
    width_size: 'large',
    height_custom: 290,
    theme_tag: 'Home',
  },
  {
    set_name: 'Numbers & Quantities',
    description: 'Numerical expressions and measurements',
    background_color: '#B0C4DE',
    icon: '🔢',
    width_size: 'small',
    height_custom: 140,
    theme_tag: 'Numbers',
  },
];

async function seedFlashcardsForAllUsers() {
  try {
    console.log('🎴 SEEDING FLASHCARDS FOR ALL USERS...\n');

    // 1. Get all verified users
    const users = await prisma.users.findMany({
      where: {
        isVerified: true,
      },
    });

    console.log(`📋 Found ${users.length} verified users\n`);

    // 2. Get all vocabs once
    const allVocabs = await prisma.vocab.findMany({
      include: {
        theme: true,
        lesson: true,
      },
    });

    console.log(`📚 Found ${allVocabs.length} vocabularies in database\n`);

    // 3. Seed for each user
    for (const user of users) {
      console.log(`\n👤 Processing: ${user.email} (ID: ${user.id})`);

      // Check if user already has sets
      const existingSets = await prisma.userFlashcardSets.count({
        where: { user_id: user.id },
      });

      if (existingSets > 0) {
        console.log(`   ⏭️  User already has ${existingSets} sets, skipping...`);
        continue;
      }

      // Create 20 flashcard sets
      let totalCards = 0;

      for (let i = 0; i < FLASHCARD_SETS.length; i++) {
        const setConfig = FLASHCARD_SETS[i];

        // Create flashcard set
        const flashcardSet = await prisma.userFlashcardSets.create({
          data: {
            user_id: user.id,
            set_name: setConfig.set_name,
            description: setConfig.description,
            background_color: setConfig.background_color,
            icon: setConfig.icon,
            width_size: setConfig.width_size,
            height_custom: setConfig.height_custom,
            theme_tag: setConfig.theme_tag,
          },
        });

        // Find matching vocabs
        let matchingVocabs = allVocabs.filter((vocab) =>
          vocab.theme?.name?.toLowerCase().includes(setConfig.theme_tag.toLowerCase())
        );

        if (matchingVocabs.length === 0) {
          matchingVocabs = allVocabs;
        }

        // Select random cards
        const cardCount = [12, 20, 20, 10, 20, 24, 10, 15, 18, 22, 14, 16, 12, 19, 17, 21, 13, 11, 23, 8][i];
        const shuffled = matchingVocabs.sort(() => 0.5 - Math.random());
        const selectedVocabs = shuffled.slice(0, Math.min(cardCount, matchingVocabs.length));

        // Create flashcard cards
        for (const vocab of selectedVocabs) {
          await prisma.userFlashcardCards.create({
            data: {
              set_id: flashcardSet.id,
              vocab_id: vocab.id,
              status: 'new',
            },
          });
        }

        totalCards += selectedVocabs.length;
      }

      console.log(`   ✅ Created 20 sets with ${totalCards} cards for ${user.email}`);
    }

    console.log('\n\n🎉 SEEDING COMPLETED!\n');

    // Display summary
    const summary = await prisma.userFlashcardSets.groupBy({
      by: ['user_id'],
      _count: { id: true },
    });

    console.log('📊 SUMMARY:');
    for (const item of summary) {
      const user = await prisma.users.findUnique({
        where: { id: item.user_id },
        select: { email: true },
      });
      console.log(`   ${user?.email}: ${item._count.id} flashcard sets`);
    }

    const totalSets = await prisma.userFlashcardSets.count();
    const totalCards = await prisma.userFlashcardCards.count();
    console.log(`\n   Total: ${totalSets} sets, ${totalCards} cards`);
  } catch (error) {
    console.error('❌ ERROR SEEDING FLASHCARDS:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run seed
seedFlashcardsForAllUsers().catch((error) => {
  console.error('SEED FAILED:', error);
  process.exit(1);
});
