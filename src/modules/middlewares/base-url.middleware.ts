import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class AppMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // Lấy đường dẫn của trang web từ request
    const baseURL = req.protocol + '://' + req.get('host');

    // Thêm đường dẫn vào biến môi trường hoặc context của ứng dụng nếu bạn muốn sử dụng nó ở các nơi khác
    process.env.BASE_URL = baseURL;

    next();
  }
}
