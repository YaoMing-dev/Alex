// prisma/upload_themes.ts
import { uploadAssets, normalizeName } from './cloudinary_uploader';
import * as path from 'path';

// Ví dụ về tên file Theme: "Accommodation-Hotels__Beginner.jpg"
const themePublicIdGenerator = (fileName: string): string => {
    // Bỏ đuôi file để lấy Public ID
    return path.parse(fileName).name;
};

async function main() {
    await uploadAssets(
        path.resolve(__dirname, 'seeds/themes'),
        'eduaion/themes', // Cloudinary folder
        'image',
        themePublicIdGenerator
    );
}

main();