import { Injectable, NestMiddleware } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class JwtAuthMiddleware implements NestMiddleware {
  constructor(private jwtService: JwtService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const token = req.cookies?.jwt;
    if (token) {
      try {
        const decoded = this.jwtService.verify(token);
        req['user'] = decoded;
      } catch (e) {
        req['user'] = undefined;
      }
    }
    next();
  }
}
