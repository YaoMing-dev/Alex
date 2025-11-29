// Script để tạo flashcard set mặc định cho tất cả user hiện tại
// Chạy script: npx ts-node scripts/createDefaultFlashcardsForExistingUsers.ts

import prisma from '../src/utils/prisma';
import FlashcardService from '../src/services/FlashcardService';

async function createDefaultFlashcardsForExistingUsers() {
  try {
    console.log('🚀 Starting migration: Create default flashcard sets for existing users...');

    // 1. Lấy tất cả users
    const allUsers = await prisma.users.findMany({
      select: { id: true, email: true, username: true },
    });

    console.log(`📊 Found ${allUsers.length} users`);

    // 2. Lọc ra users chưa có flashcard set nào
    const usersWithoutFlashcards = [];

    for (const user of allUsers) {
      const existingSets = await prisma.userFlashcardSets.count({
        where: { user_id: user.id },
      });

      if (existingSets === 0) {
        usersWithoutFlashcards.push(user);
      }
    }

    console.log(`✅ ${usersWithoutFlashcards.length} users need default flashcard sets`);

    // 3. Tạo flashcard set mặc định cho từng user
    let successCount = 0;
    let failCount = 0;

    for (const user of usersWithoutFlashcards) {
      try {
        console.log(`  Creating flashcard set for user ${user.id} (${user.email})...`);
        await FlashcardService.createDefaultFlashcardSet(user.id);
        successCount++;
        console.log(`  ✓ Success for user ${user.id}`);
      } catch (error) {
        failCount++;
        console.error(`  ✗ Failed for user ${user.id}:`, error);
      }
    }

    console.log('\n📈 Migration Summary:');
    console.log(`  Total users: ${allUsers.length}`);
    console.log(`  Users needing flashcards: ${usersWithoutFlashcards.length}`);
    console.log(`  Successfully created: ${successCount}`);
    console.log(`  Failed: ${failCount}`);
    console.log('\n✨ Migration completed!');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run migration
createDefaultFlashcardsForExistingUsers();
