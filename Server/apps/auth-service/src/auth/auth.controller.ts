import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';

import auth from './auth';

interface ValidateSessionRequest {
  cookie: string;
}

@Controller()
export class AuthGrpcController {
  @GrpcMethod('AuthService', 'ValidateSession')
  async validateSession(data: ValidateSessionRequest) {
    if (!data.cookie) {
      return {
        valid: false,
        userId: '',
        email: '',
        name: '',
      };
    }

    const headers = new Headers();
    headers.set('cookie', data.cookie);

    const session = await auth.api.getSession({ headers });

    if (!session) {
      return {
        valid: false,
        userId: '',
        email: '',
        name: '',
      };
    }

    return {
      valid: true,
      userId: session.user.id,
      email: session.user.email,
      name: session.user.name ?? '',
    };
  }
}
