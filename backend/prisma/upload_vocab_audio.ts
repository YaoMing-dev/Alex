// prisma/upload_vocab_audio.ts (Sửa đổi đường dẫn)
import { uploadAssets } from './cloudinary_uploader';
import * as path from 'path';

// Ví dụ về tên file Audio: "word_us.mp3" hoặc "word_uk.mp3"
const audioPublicIdGenerator = (fileName: string): string => {
    // Bỏ đuôi file để lấy Public ID (Ví dụ: "word_us")
    return path.parse(fileName).name;
};

async function main() {
    // Đường dẫn gốc của script: __dirname
    const BASE_AUDIO_PATH = path.resolve(__dirname, 'seeds/audio');

    // --- UPLOAD US AUDIO ---
    // const US_LOCAL_FOLDER = path.join(BASE_AUDIO_PATH, 'us_audio_split_24m');
    // const US_CLOUDINARY_FOLDER = 'eduaion/audio/us_audio_split_24m'; // Giữ nguyên theo log thành công

    // await uploadAssets(
    //     US_LOCAL_FOLDER,
    //     US_CLOUDINARY_FOLDER,
    //     'raw',
    //     audioPublicIdGenerator
    // );

    // --- UPLOAD UK AUDIO ---
    const UK_LOCAL_FOLDER = path.join(BASE_AUDIO_PATH, 'uk_audio_split_24m');
    const UK_CLOUDINARY_FOLDER = 'eduaion/audio/uk_audio_split_24m'; // Giữ nguyên theo log thành công

    await uploadAssets(
        UK_LOCAL_FOLDER,
        UK_CLOUDINARY_FOLDER,
        'raw',
        audioPublicIdGenerator
    );
}

main();