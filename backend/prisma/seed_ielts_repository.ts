// File: prisma/seed_ielts_repository.ts

import { PrismaClient, WritingType, Level } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import csv from 'csv-parser';

const prisma = new PrismaClient();

// Định nghĩa Interface cho dữ liệu CSV
interface CsvRow {
    id: string;
    type: 'Task 1' | 'Task 2';
    description: string;
    prompt: string;
    level: string;
    image_url: string;
    sample_answer: string;
}

// LẤY ĐƯỜNG DẪN CỦA THƯ MỤC HIỆN TẠI (prisma/)
const currentDir = __dirname;

// ĐIỀU CHỈNH ĐƯỜNG DẪN: Lấy file từ thư mục hiện tại (prisma/)
const TASK1_FILE = path.join(currentDir, 'seeds/ielts_mentor_task1.csv');
const TASK2_FILE = path.join(currentDir, 'seeds/ielts_mentor_task2.csv');

/**
 * Ánh xạ string level từ CSV sang Level Enum của Prisma
 */
const mapLevel = (levelStr: string): Level => {
    switch (levelStr?.toLowerCase()) {
        case 'beginner':
            return Level.Beginner;
        case 'intermediate':
        case 'inter': // Xử lý nếu có lỗi chính tả trong dữ liệu thô
            return Level.Intermediate;
        case 'advanced':
            return Level.Advanced;
        default:
            console.warn(`Cảnh báo: Level không xác định '${levelStr}'. Dùng Intermediate.`);
            return Level.Intermediate;
    }
};

/**
 * Đọc dữ liệu từ file CSV
 */
const loadCsvData = (filePath: string): Promise<CsvRow[]> => {
    // Kiểm tra xem file có tồn tại không
    if (!fs.existsSync(filePath)) {
        console.error(`LỖI: Không tìm thấy file CSV tại đường dẫn: ${filePath}`);
        return Promise.resolve([]); // Trả về mảng rỗng để không crash
    }

    const results: CsvRow[] = [];
    return new Promise((resolve, reject) => {
        fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', (data) => results.push(data))
            .on('end', () => {
                console.log(`Đã đọc ${results.length} dòng từ ${path.basename(filePath)}`);
                resolve(results);
            })
            .on('error', (error) => {
                reject(error);
            });
    });
};

async function main() {
    console.log('--- Bắt đầu Seeding Dữ liệu IELTS Repository ---');

    // 1. Xóa dữ liệu cũ (Đề xuất: Tắt tính năng này nếu bạn muốn bảo toàn ID)
    // await prisma.ieltsRepository.deleteMany();
    // console.log('Đã xóa dữ liệu IeltsRepository cũ.');

    // 2. Tải dữ liệu Task 1 và Task 2
    const task1Data = await loadCsvData(TASK1_FILE);
    const task2Data = await loadCsvData(TASK2_FILE);

    const allData = [...task1Data, ...task2Data].filter(row => row.prompt && row.sample_answer); // Lọc bỏ hàng không có dữ liệu cần thiết

    if (allData.length === 0) {
        console.warn('❌ KHÔNG CÓ DỮ LIỆU ĐỂ SEED. Vui lòng kiểm tra đường dẫn file CSV và nội dung file.');
        return;
    }

    console.log(`Tổng cộng ${allData.length} đề cần chèn.`);

    // 3. Chèn dữ liệu vào Database
    const records = allData.map(row => ({
        type: row.type === 'Task 1' ? WritingType.Task1 : WritingType.Task2,
        description: row.description || row.prompt,
        prompt: row.prompt,
        level: mapLevel(row.level),
        sample_answer: row.sample_answer,
        image_url: row.image_url || null,
    }));

    const result = await prisma.ieltsRepository.createMany({
        data: records,
        skipDuplicates: true, // Bỏ qua nếu có trùng lặp
    });

    console.log(`✅ Thành công! Đã chèn ${result.count} đề IELTS vào database.`);
}

main()
    .catch((e) => {
        console.error("Lỗi trong quá trình Seed:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });