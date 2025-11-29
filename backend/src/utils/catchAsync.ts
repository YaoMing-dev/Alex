// eduaion/backend/src/utils/catchAsync.ts

import { Request, Response, NextFunction } from 'express';

// Định nghĩa kiểu cho một Controller Asynchronous
// ControllerFn nhận req, res, next và trả về Promise<any> (vì nó là async)
type ControllerFn = (req: Request, res: Response, next: NextFunction) => Promise<any>;

/**
 * Hàm wrapper để bắt lỗi từ các Controller Asynchronous.
 * Nó nhận một ControllerFn và trả về một Middleware mới.
 * @param fn Controller function (async)
 * @returns Middleware function
 */
const catchAsync = (fn: ControllerFn) => {
    // Trả về một Middleware function mới
    return (req: Request, res: Response, next: NextFunction) => {
        // Gọi Controller function (fn). 
        // Nếu nó thành công, nó sẽ resolve.
        // Nếu nó gặp lỗi, nó sẽ reject.
        // .catch(next) sẽ bắt lỗi đó và tự động gọi next(error), 
        // chuyển nó tới Global Error Handler.
        fn(req, res, next).catch(next);
    };
};

export default catchAsync;