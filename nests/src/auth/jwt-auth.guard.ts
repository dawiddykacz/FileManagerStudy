import { Injectable, ExecutionContext, UnauthorizedException  } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request, Response } from 'express';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    const req = context.switchToHttp().getRequest<Request>();
    const res = context.switchToHttp().getResponse<Response>();
    
    if (!user) {
        throw new UnauthorizedException('Unauthorized');
    }

    req.user = user;
    return user;
  }
}
