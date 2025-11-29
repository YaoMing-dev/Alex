// prisma/upload_lessons.ts
import { uploadAssets, normalizeName } from './cloudinary_uploader';
import * as path from 'path';

// Ví dụ về tên file Lesson: "Accommodation-Hotels__Beginner__Order-1.jpg"
const lessonPublicIdGenerator = (fileName: string): string => {
    // Bỏ đuôi file để lấy Public ID
    return path.parse(fileName).name;
};

async function main() {
    await uploadAssets(
        path.resolve(__dirname, 'seeds/lessons'),
        'eduaion/lessons', // Cloudinary folder
        'image',
        lessonPublicIdGenerator
    );
}

main();