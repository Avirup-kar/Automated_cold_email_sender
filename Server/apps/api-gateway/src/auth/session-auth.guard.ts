import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  OnModuleInit,
  UnauthorizedException,
} from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

import { AUTH_SERVICE_CLIENT } from '../app/grpc.constants';
import type { AuthGrpcService, AuthenticatedRequest } from './auth.types';

@Injectable()
export class SessionAuthGuard implements CanActivate, OnModuleInit {
  private authService!: AuthGrpcService;

  constructor(
    @Inject(AUTH_SERVICE_CLIENT) private readonly authClient: ClientGrpc,
  ) {}

  onModuleInit(): void {
    this.authService =
      this.authClient.getService<AuthGrpcService>('AuthService');
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const cookie = request.headers.cookie;

    if (!cookie) {
      throw new UnauthorizedException();
    }

    try {
      const session = await firstValueFrom(
        this.authService.validateSession({ cookie }),
      );

      if (!session.valid || !session.userId) {
        throw new UnauthorizedException();
      }

      request.user = {
        userId: session.userId,
        email: session.email,
        name: session.name,
      };
      return true;
    } catch {
      throw new UnauthorizedException();
    }
  }
}
