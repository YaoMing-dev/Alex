// eduaion/backend/src/types/express.d.ts

import { Level } from '@prisma/client'; // Import Enum Level từ Prisma

// Sử dụng namespace augmentation để thêm thuộc tính vào Request của Express
declare global {
    namespace Express {
        // Interface User sẽ định nghĩa các thuộc tính mà bạn gán cho req.user
        interface User {
            userId: string;
            email: string;
            level?: Level; // Thêm level, dùng optional nếu có thể không có
        }

        // Interface Request sẽ định nghĩa lại thuộc tính user
        interface Request {
            user?: User;
        }
    }
}

// export rỗng để đảm bảo file này được coi là một module
export { };