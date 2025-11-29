import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import { parse } from 'csv-parse/sync';

const prisma = new PrismaClient();
const BATCH_SIZE = 100;
const SEEDS_DIR = path.join(__dirname, 'seeds');

async function seedFromCSV() {
  try {
    console.log('BẮT ĐẦU SEED DỮ LIỆU CHO FLASHCARD & QUIZ SYSTEM');

    // SEED VOCAB (for flashcards)
    await seedTable('vocab', 'Vocab.csv', (record: any) => ({
      id: parseInt(record.id),
      internalId: record.internalId,
      word: record.word,
      type: record.type || null,
      cefr: record.cefr || null,
      ipa_us: record.ipa_us || null,
      ipa_uk: record.ipa_uk || null,
      meaning_en: record.meaning_en,
      meaning_vn: record.meaning_vn || null,
      example: record.example || null,
      audio_url: record.audio_url || null,
      audio_url_uk: record.audio_url_uk || null,
      created_at: new Date(record.created_at),
    }));

    console.log('SEED HOÀN TẤT – VOCAB ĐÃ ĐƯỢC SEED!');
  } catch (error) {
    console.error('LỖI SEED:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

async function seedTable(
  modelName: string, // ← DÙNG camelCase
  fileName: string,
  transform: (record: any) => any
) {
  const filePath = path.join(SEEDS_DIR, fileName);
  if (!fs.existsSync(filePath)) {
    console.warn(`FILE KHÔNG TỒN TẠI: ${fileName}`);
    return;
  }

  console.log(`\n--- ĐANG SEED ${modelName.toUpperCase()} TỪ ${fileName} ---`);
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const records: any[] = parse(fileContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
    bom: true,
  });

  console.log(`TÌM THẤY ${records.length} BẢN GHI`);

  // SỬA: Dùng tên model đúng (camelCase)
  const model = (prisma as any)[modelName];

  if (!model) {
    throw new Error(`Model ${modelName} không tồn tại trong Prisma Client`);
  }

  for (let i = 0; i < records.length; i += BATCH_SIZE) {
    const batch = records.slice(i, i + BATCH_SIZE);
    const data = batch.map(transform).filter(Boolean);

    if (data.length === 0) continue;

    try {
      for (const item of data) {
        await model.upsert({
          where: { id: item.id },
          update: item,
          create: item,
        });
      }
      console.log(`SEED BATCH ${i + 1}-${Math.min(i + BATCH_SIZE, records.length)}/${records.length}`);
    } catch (batchError: any) {
      console.error(`LỖI BATCH ${i + 1}:`, batchError.message);
      if (batchError.code === 'P2002') {
        console.log(`→ Bỏ qua duplicate id`);
      } else {
        throw batchError;
      }
    }
  }
}

seedFromCSV().catch((e) => {
  console.error('SEED THẤT BẠI:', e);
  process.exit(1);
});