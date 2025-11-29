// backend/prisma/seed_vocab.ts

import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { PrismaClient, Prisma, Level } from '@prisma/client';
import csv from 'csv-parser';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const db = new PrismaClient();

// Định nghĩa Interface cho dữ liệu CSV để có Type Checking
interface CsvRow {
  No: string;
  word: string;
  meaning_vn: string;
  type: string;
  cefr: string;
  phon_br: string;
  phon_n_am: string;
  definition: string;
  example: string;
  uk: string;
  us: string;
  level: string;
  theme: string;
  lesson: string;
}

const VOCAB_CSV_PATH = path.join(__dirname, 'seeds/cleaned_vocab_refined.csv');
const BATCH_SIZE = 500;

/**
 * 0. Dọn dẹp Database (Đảm bảo việc Seeding bắt đầu từ trạng thái sạch)
 */
async function cleanDatabase() {
  console.log("--- Bắt đầu DỌN DẸP DATABASE ---");
  // Thứ tự xóa phải ngược lại với thứ tự tạo để tránh lỗi khóa ngoại (Foreign Key)
  await db.vocab.deleteMany({});
  await db.lesson.deleteMany({});
  await db.theme.deleteMany({});
  console.log("Đã dọn dẹp Vocab, Lesson, và Theme thành công.");
}

/**
 * 1. Đọc file CSV và trả về Array<CsvRow>.
 */
async function loadCsvData(): Promise<CsvRow[]> {
  const data: CsvRow[] = [];
  console.log(`Bắt đầu đọc file CSV từ: ${VOCAB_CSV_PATH}`);
  await new Promise<void>((resolve, reject) => {
    fs.createReadStream(VOCAB_CSV_PATH)
      .pipe(csv())
      .on('data', (row) => data.push(row))
      .on('end', () => {
        console.log(`Đã đọc xong ${data.length} dòng dữ liệu.`);
        resolve();
      })
      .on('error', reject);
  });
  return data;
}

/**
 * 2. SEED THEMES
 */
async function seedThemes(rows: CsvRow[]) {
  // ... (Logic giữ nguyên)
  console.log("--- Bắt đầu SEED THEMES ---");
  const uniqueThemes = new Map<string, { name: string, level: Level }>();
  rows.forEach(row => {
    if (row.theme && row.level) {
      const key = `${row.theme}_${row.level}`;
      if (!uniqueThemes.has(key)) {
        uniqueThemes.set(key, { name: row.theme, level: row.level as Level });
      }
    }
  });

  const themeData = Array.from(uniqueThemes.values());
  for (const theme of themeData) {
    await db.theme.upsert({
      where: { name_level: { name: theme.name, level: theme.level } },
      update: {},
      create: theme,
    });
  }
  console.log(`Đã seed thành công ${themeData.length} Theme/Level combinations.`);
  return db.theme.findMany({});
}

/**
 * 3. SEED LESSONS
 */
async function seedLessons(rows: CsvRow[], allThemes: Awaited<ReturnType<typeof db.theme.findMany>>) {
  console.log("--- Bắt đầu SEED LESSONS ---");
  const themeMap = new Map<string, number>();
  allThemes.forEach(t => themeMap.set(`${t.name}_${t.level}`, t.id));

  const uniqueLessons = new Map<string, Prisma.LessonCreateManyInput>();
  rows.forEach(row => {
    const groupId = row.lesson;
    if (groupId) {
      const [theme_name, level_str, lesson_part] = groupId.split('_');
      const themeKey = `${theme_name}_${level_str}`;

      if (themeMap.has(themeKey)) {
        const theme_id = themeMap.get(themeKey)!;
        const order = parseInt(lesson_part.replace('Lesson', ''));
        const lessonName = `Lesson ${order}`;
        const uniqueKey = `${theme_id}_${order}`;

        if (!uniqueLessons.has(uniqueKey)) {
          uniqueLessons.set(uniqueKey, {
            name: lessonName,
            order: order,
            level: level_str as Level,
            theme_id: theme_id,
          });
        }
      }
    }
  });

  const lessonsToCreate = Array.from(uniqueLessons.values());
  await db.lesson.createMany({ data: lessonsToCreate });

  console.log(`Đã seed thành công ${lessonsToCreate.length} Lessons.`);
  return db.lesson.findMany({});
}

/**
 * 4. SEED VOCABS
 */
async function seedVocabs(rows: CsvRow[], allThemes: Awaited<ReturnType<typeof db.theme.findMany>>, allLessons: Awaited<ReturnType<typeof db.lesson.findMany>>) {
  console.log("--- Bắt đầu SEED VOCABS ---");

  const themeMap = new Map<string, number>();
  allThemes.forEach(t => themeMap.set(`${t.name}_${t.level}`, t.id));

  const lessonMap = new Map<string, number>();
  allLessons.forEach(l => lessonMap.set(`${l.theme_id}_${l.order}`, l.id));

  const vocabData: Prisma.VocabCreateManyInput[] = [];

  rows.forEach((row, index) => { // 💡 SỬ DỤNG INDEX CỦA MẢNG ĐỂ ĐẢM BẢO TÍNH DUY NHẤT
    const themeKey = `${row.theme}_${row.level}`;
    const groupId = row.lesson;
    const [, , lesson_part] = groupId.split('_');
    const order = parseInt(lesson_part.replace('Lesson', ''));

    const theme_id = themeMap.get(themeKey);
    const lessonKey = theme_id ? `${theme_id}_${order}` : '';
    const lesson_id = lessonMap.get(lessonKey);

    // SỬ DỤNG INDEX + WORD ĐỂ TẠO INTERNAL ID DUY NHẤT
    const safeWord = row.word.replace(/[^a-z0-9]/gi, '-').toLowerCase();
    // Index + Word là đủ duy nhất cho mục đích seeding
    const internalId = `${index + 1}-${safeWord}`.substring(0, 255); // Giới hạn 255 ký tự (an toàn)


    if (theme_id && lesson_id) {
      vocabData.push({
        internalId: internalId, // Đã sửa lỗi P2002
        word: row.word,
        type: row.type || null,
        cefr: row.cefr || null,
        ipa_us: row.phon_n_am || null,
        ipa_uk: row.phon_br || null,
        meaning_en: row.definition,
        meaning_vn: row.meaning_vn || null,
        example: row.example || null,
        audio_url: row.us || null,
        theme_id: theme_id,
        lesson_id: lesson_id
      });
    }
  });

  // Bulk insert Vocab
  for (let i = 0; i < vocabData.length; i += BATCH_SIZE) {
    const batch = vocabData.slice(i, i + BATCH_SIZE);
    await db.vocab.createMany({
      data: batch,
    });
    console.log(`Seeded vocab batch ${i / BATCH_SIZE + 1}/${Math.ceil(vocabData.length / BATCH_SIZE)}`);
  }

  console.log(`Đã seed thành công ${vocabData.length} Vocab.`);
}


async function main() {
  try {
    // 0. Dọn dẹp DB trước
    await cleanDatabase();

    const csvRows = await loadCsvData();

    // 1. Seed Themes
    const allThemes = await seedThemes(csvRows);

    // 2. Seed Lessons
    const allLessons = await seedLessons(csvRows, allThemes);

    // 3. Seed Vocabs
    await seedVocabs(csvRows, allThemes, allLessons);

    console.log("\n✅ Quá trình Seeding Dữ liệu Từ Vựng HOÀN TẤT!");

  } catch (error) {
    console.error("LỖI trong quá trình Seeding Dữ liệu:", error);
    process.exit(1);
  } finally {
    await db.$disconnect();
  }
}

main();