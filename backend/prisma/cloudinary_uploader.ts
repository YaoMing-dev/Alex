// prisma/cloudinary_uploader.ts
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { v2 as cloudinary } from 'cloudinary';

// Tải biến môi trường
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Cấu hình Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
});

// Kích thước lô (batch size) - Giảm số lượng upload đồng thời để tránh lỗi
const UPLOAD_BATCH_SIZE = 50;

/**
 * Hàm chuẩn hóa tên Theme và Lesson để tạo Public ID.
 * Phải khớp 100% với logic đã dùng trong script cập nhật DB.
 */
export function normalizeName(name: string): string {
    // Thay thế khoảng trắng và '&' thành '-' và loại bỏ ký tự không an toàn khác
    return name.replace(/[& ]/g, '-').replace(/[^a-zA-Z0-9-]/g, '');
}

/**
 * Hàm upload chính (Đã cải thiện xử lý lỗi)
 */
export async function uploadAssets(
    localFolderPath: string,
    cloudinaryFolder: string,
    resourceType: 'image' | 'raw',
    publicIdGenerator: (fileName: string) => string
): Promise<void> {
    const files = fs.readdirSync(localFolderPath).filter(
        file => (resourceType === 'image' && file.endsWith('.jpg')) ||
            (resourceType === 'raw' && (file.endsWith('.mp3') || file.endsWith('.ogg')))
    );

    if (files.length === 0) {
        console.log(`\n⚠️ KHÔNG TÌM THẤY file nào trong thư mục: ${localFolderPath}. Bỏ qua.`);
        return;
    }

    console.log(`\n--- Bắt đầu Upload ${files.length} files tới Cloudinary Folder: ${cloudinaryFolder} (Batch Size: ${UPLOAD_BATCH_SIZE}) ---`);

    const totalBatches = Math.ceil(files.length / UPLOAD_BATCH_SIZE);

    for (let i = 0; i < files.length; i += UPLOAD_BATCH_SIZE) {
        const batchFiles = files.slice(i, i + UPLOAD_BATCH_SIZE);
        const batchNumber = Math.floor(i / UPLOAD_BATCH_SIZE) + 1;

        console.log(`\nĐang xử lý LÔ ${batchNumber}/${totalBatches} (${batchFiles.length} files)...`);

        const uploadPromises = batchFiles.map(file => {
            const filePath = path.join(localFolderPath, file);
            const publicId = publicIdGenerator(file);

            return cloudinary.uploader.upload(filePath, {
                resource_type: resourceType,
                public_id: publicId,
                folder: cloudinaryFolder,
                overwrite: true,
                format: path.extname(file).replace('.', ''),
                chunk_size: 6000000,
            })
                .then(result => {
                    console.log(`[OK] ${file}`);
                    return result;
                })
                .catch(error => {
                    const errorMessage = error?.message || 'Lỗi không xác định';
                    console.error(`[LỖI] ${file}. Public ID: ${publicId}. Lỗi: ${errorMessage}`);
                    // Ghi file lỗi để kiểm tra sau
                    fs.appendFileSync(path.resolve(__dirname, 'upload_error_log.txt'), `${file} | ${errorMessage}\n`);
                    return null;
                });
        });

        // Chạy song song trong 1 lô
        await Promise.all(uploadPromises);

        // Đợi 5 giây giữa các lô để đảm bảo API không bị Rate Limit
        if (batchNumber < totalBatches) {
            console.log(`\nĐợi 5 giây trước khi chuyển sang LÔ ${batchNumber + 1}...`);
            await new Promise(resolve => setTimeout(resolve, 5000));
        }
    }

    console.log(`\n✅ HOÀN TẤT Upload tới ${cloudinaryFolder}.`);
}