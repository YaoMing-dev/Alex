// prisma/update_cloudinary_urls.ts

import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { PrismaClient, Prisma, Level, Theme, Lesson } from '@prisma/client';
import csv from 'csv-parser';

// Tải biến môi trường
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const db = new PrismaClient();

// 💡 Cấu hình Cloudinary Folder và Base URL
const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;

if (!CLOUDINARY_CLOUD_NAME) {
    throw new Error("CLOUDINARY_CLOUD_NAME không được thiết lập trong .env");
}

// -----------------------------------------------------------
// 📌 CÁC HẰNG SỐ QUAN TRỌNG: PHẢI KHỚP VỚI SCRIPT UPLOAD!
// -----------------------------------------------------------
// Ảnh Lesson & Theme (Giả định nằm trong các folder riêng biệt như script upload trước đó)
const CLOUDINARY_THEME_FOLDER = 'eduaion/themes';
const CLOUDINARY_LESSON_FOLDER = 'eduaion/lessons';

// Audio Vocab (Sử dụng cấu trúc folder chi tiết mà bạn đã xác nhận)
const CLOUDINARY_US_AUDIO_FOLDER = 'eduaion/audio/us_audio_split_24m';
const CLOUDINARY_UK_AUDIO_FOLDER = 'eduaion/audio/uk_audio_split_24m';

// Đường dẫn file CSV cũ (dùng để trích xuất internalId, tên file audio và các khóa logic)
const VOCAB_CSV_PATH = path.join(__dirname, 'seeds/cleaned_vocab_refined.csv');

// Định nghĩa Interface cho dữ liệu CSV cũ
interface CsvRow {
    // ... (các trường khác giữ nguyên)
    word: string;
    level: string;
    theme: string;
    lesson: string; // Dạng: Theme__Level__LessonX
    uk: string; // Tên file audio UK (ví dụ: 'word_uk.mp3')
    us: string; // Tên file audio US (ví dụ: 'word_us.mp3')
}

// -----------------------------------------------------------
// 🌐 HÀM HỖ TRỢ XÂY DỰNG URL VÀ ID
// -----------------------------------------------------------

/**
 * Hàm chuẩn hóa tên Theme để tạo Public ID (đã dùng trong script upload)
* FIX: Chỉ thay thế ký tự không an toàn bằng gạch nối, sau đó rút gọn.
 */
function normalizeName(name: string): string {
    // 1. Thay thế tất cả ký tự không phải chữ, số, hoặc gạch nối bằng một dấu gạch nối
    let normalized = name.replace(/[^a-zA-Z0-9-]/g, '-');

    // 2. Rút gọn nhiều dấu gạch nối liên tiếp thành một
    normalized = normalized.replace(/-+/g, '-');

    // 3. Loại bỏ gạch nối ở đầu/cuối chuỗi (nếu có)
    return normalized.replace(/^-|-$/g, '');
}

/**
 * Hàm xây dựng URL Cloudinary (Đảm bảo URL luôn là secure (https) và dùng upload action)
 */
function buildCloudinaryUrl(publicId: string, folder: string, resourceType: 'image' | 'raw', format: string): string {
    // Luôn sử dụng 'upload' action
    return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/${resourceType}/upload/${folder}/${publicId}.${format}`;
}

// -----------------------------------------------------------
// 1. Cập nhật imageUrl cho Theme
// -----------------------------------------------------------
async function updateThemeUrls() {
    console.log("--- Bắt đầu CẬP NHẬT IMAGE URL cho THEME ---");
    const allThemes = await db.theme.findMany({});
    const updates = [];

    for (const theme of allThemes) {
        // Public ID Theme: ThemeName__Level (KHỚP VỚI LOGIC UPLOAD)
        const normalizedThemeName = normalizeName(theme.name);
        const publicId = `${normalizedThemeName}__${theme.level}`;

        const imageUrl = buildCloudinaryUrl(
            publicId,
            CLOUDINARY_THEME_FOLDER,
            'image',
            'jpg' // Định dạng ảnh Theme
        );

        updates.push(db.theme.update({
            where: { id: theme.id },
            data: { imageUrl: imageUrl }
        }));
    }

    await Promise.all(updates);
    console.log(`✅ Đã cập nhật thành công ${updates.length} Theme Image URLs.`);
}

// -----------------------------------------------------------
// 2. Cập nhật imageUrl cho Lesson
// -----------------------------------------------------------
async function updateLessonUrls() {
    console.log("--- Bắt đầu CẬP NHẬT IMAGE URL cho LESSON ---");
    // Lấy Lessons kèm theo Theme để trích xuất tên Theme
    const allLessons = await db.lesson.findMany({ include: { theme: true } });
    const updates = [];

    for (const lesson of allLessons) {
        if (!lesson.theme) continue;

        // Public ID Lesson: ThemeName__Level__Order-X (KHỚP VỚI LOGIC UPLOAD)
        const normalizedThemeName = normalizeName(lesson.theme.name);
        const publicId = `${normalizedThemeName}__${lesson.level}__Order-${lesson.order}`;

        const imageUrl = buildCloudinaryUrl(
            publicId,
            CLOUDINARY_LESSON_FOLDER,
            'image',
            'jpg' // Định dạng ảnh Lesson
        );

        updates.push(db.lesson.update({
            where: { id: lesson.id },
            data: { imageUrl: imageUrl }
        }));
    }

    await Promise.all(updates);
    console.log(`✅ Đã cập nhật thành công ${updates.length} Lesson Image URLs.`);
}

const BATCH_SIZE = 500; // Định nghĩa kích thước lô cập nhật

// -----------------------------------------------------------
// 3. Cập nhật audio_url (US/UK) cho Vocab (ĐÃ SỬA ĐỔI CHIẾN LƯỢC CẬP NHẬT)
// -----------------------------------------------------------
async function updateVocabUrls(csvRows: CsvRow[]) {
    console.log("--- Bắt đầu CẬP NHẬT AUDIO URL cho VOCAB (US & UK) ---");

    // ... (Phần logic tạo vocabDataMap và lấy existingVocabs giữ nguyên) ...

    const vocabDataMap = new Map<string, { usAudioFile: string, ukAudioFile: string }>();

    csvRows.forEach((row, index) => {
        // LẤY LẠI LOGIC internalId: PHẢI KHỚP TUYỆT ĐỐI VỚI SCRIPT seed_vocab.ts
        const safeWord = row.word.replace(/[^a-z0-9]/gi, '-').toLowerCase();
        const internalId = `${index + 1}-${safeWord}`.substring(0, 255);

        vocabDataMap.set(internalId, { usAudioFile: row.us, ukAudioFile: row.uk || '' });
    });

    const existingVocabs = await db.vocab.findMany({
        where: { internalId: { in: Array.from(vocabDataMap.keys()) } }
    });

    // 💡 KHÔNG CÒN SỬ DỤNG MẢNG `updates` để push Promise nữa!
    const updatesToPerform = [];

    for (const vocab of existingVocabs) {
        const vocabMapEntry = vocabDataMap.get(vocab.internalId);

        if (vocabMapEntry) {
            let usAudioUrl: string | null = null;
            let ukAudioUrl: string | null = null;

            // Xử lý US Accent
            if (vocabMapEntry.usAudioFile) {
                const usPublicId = path.parse(vocabMapEntry.usAudioFile).name;
                usAudioUrl = buildCloudinaryUrl(
                    usPublicId,
                    CLOUDINARY_US_AUDIO_FOLDER,
                    'raw',
                    'mp3'
                );
            }

            // Xử lý UK Accent
            if (vocabMapEntry.ukAudioFile) {
                const ukPublicId = path.parse(vocabMapEntry.ukAudioFile).name;
                ukAudioUrl = buildCloudinaryUrl(
                    ukPublicId,
                    CLOUDINARY_UK_AUDIO_FOLDER,
                    'raw',
                    'mp3'
                );
            }

            // Nếu có ít nhất một URL được tạo, thêm vào danh sách cần cập nhật
            if (usAudioUrl || ukAudioUrl) {
                updatesToPerform.push({
                    where: { id: vocab.id },
                    data: {
                        audio_url: usAudioUrl,
                        audio_url_uk: ukAudioUrl
                    }
                });
            }
        }
    }

    console.log(`\nTìm thấy ${updatesToPerform.length} bản ghi Vocab cần cập nhật.`);
    const totalBatches = Math.ceil(updatesToPerform.length / BATCH_SIZE);

    // 💡 CHIẾN LƯỢC CẬP NHẬT MỚI: DÙNG $transaction VÀ CHẠY THEO LÔ
    for (let i = 0; i < updatesToPerform.length; i += BATCH_SIZE) {
        const batch = updatesToPerform.slice(i, i + BATCH_SIZE);
        const batchNumber = Math.floor(i / BATCH_SIZE) + 1;

        console.log(`Đang xử lý LÔ ${batchNumber}/${totalBatches} (${batch.length} updates)...`);

        // Tạo một mảng các Promise update
        const batchUpdates = batch.map(update =>
            db.vocab.update(update)
        );

        // Chạy tất cả các update trong lô như một giao dịch duy nhất
        // ❌ LỖI ĐÃ XẢY RA: Tham số `timeout` không được chấp nhận khi truyền vào một mảng Promise.
        await db.$transaction(batchUpdates /* , { timeout: 60000 } */);
        // ✅ ĐÃ SỬA: BỎ tham số tùy chọn thứ hai đi.

        console.log(`LÔ ${batchNumber} hoàn tất.`);

        // Đợi 2 giây giữa các lô để đảm bảo Neon ổn định kết nối
        if (batchNumber < totalBatches) {
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
    }

    console.log(`\n✅ Đã cập nhật thành công ${updatesToPerform.length} Vocab Audio (US & UK Accent) URLs.`);
}

// -----------------------------------------------------------
// Hàm chính
// -----------------------------------------------------------
async function main() {
    try {
        console.log("\n*** BẮT ĐẦU CẬP NHẬT URL CLOUDINARY ***");

        // 1. Cập nhật Theme URLs
        // await updateThemeUrls();

        // 2. Cập nhật Lesson URLs
        await updateLessonUrls();

        // 3. Cập nhật Vocab Audio URLs (Cần đọc lại CSV để lấy tên file audio)
        // const csvRows = await new Promise<CsvRow[]>((resolve, reject) => {
        //     const data: CsvRow[] = [];
        //     fs.createReadStream(VOCAB_CSV_PATH)
        //         .pipe(csv())
        //         .on('data', (row) => data.push(row))
        //         .on('end', () => resolve(data))
        //         .on('error', reject);
        // });
        // await updateVocabUrls(csvRows);

        console.log("\n✅ Cập nhật URL Cloudinary HOÀN TẤT!");

    } catch (error) {
        console.error("LỖI trong quá trình cập nhật URL:", error);
        process.exit(1);
    } finally {
        await db.$disconnect();
    }
}

main();