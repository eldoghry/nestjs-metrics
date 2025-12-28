import { Injectable, NestMiddleware } from '@nestjs/common';
import { randomBytes } from 'crypto';
import { NextFunction } from 'express';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // Injecting a custom value into the request object
    req['user'] = {
      name: 'username',
      id: randomBytes(8).toString('hex'),
    };

    console.log('Value injected successfully');
    next();
  }
}
