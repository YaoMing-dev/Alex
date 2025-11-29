// eduaion/backend/src/controllers/CloudinaryController.ts

import { Request, Response, NextFunction } from 'express';
import AppError from '../utils/AppError';
import catchAsync from '../utils/catchAsync';
import cloudinary from '../utils/cloudinary'; // Import utility đã tạo

// Hàm này sẽ xóa một resource (ảnh) trên Cloudinary bằng public ID
const deleteImage = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    // Frontend gửi publicId trong body
    const { publicId } = req.body;

    if (!publicId) {
        return next(new AppError('Missing publicId in request body.', 400));
    }

    try {
        // Sử dụng hàm destroy() của Cloudinary để xóa ảnh
        const result = await cloudinary.uploader.destroy(publicId, {
            // Xác định loại resource nếu cần (mặc định là 'image')
            resource_type: 'image',
        });

        // Kiểm tra kết quả trả về
        if (result.result === 'ok') {
            res.status(200).json({
                status: 'success',
                message: 'Image successfully deleted from Cloudinary.',
                publicId,
            });
        } else if (result.result === 'not found') {
            // Xử lý trường hợp ảnh không tồn tại
            res.status(220).json({ // Dùng 220 cho trường hợp OK nhưng không cần thực hiện gì
                status: 'skipped',
                message: 'Image not found on Cloudinary (already deleted or wrong ID).',
                publicId,
            });
        } else {
            // Lỗi khác từ Cloudinary
            return next(new AppError(`Cloudinary error: ${result.result}`, 500));
        }

    } catch (error: any) {
        console.error('Cloudinary Deletion Error:', error.message);
        return next(new AppError('Failed to delete image on Cloudinary.', 500));
    }
});

export { deleteImage };