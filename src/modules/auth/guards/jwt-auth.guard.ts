// src/modules/auth/guards/jwt-auth.guard.ts

import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const token = request.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      throw new UnauthorizedException('No se proporcionó ningún token');
    }
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any) {
    if (info?.name === 'TokenExpiredError') {
      throw new UnauthorizedException('El token ha caducado. Por favor, inicie sesión de nuevo.');
    }

    if (info?.name === 'JsonWebTokenError') {
      throw new UnauthorizedException('Firma de token inválida.');
    }

    if (err || !user) {
      throw err || new UnauthorizedException('Acceso no autorizado');
    }
    return user;
  }
}
