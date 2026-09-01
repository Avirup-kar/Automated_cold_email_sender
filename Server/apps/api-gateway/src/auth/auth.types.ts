import { Request } from 'express';
import { Observable } from 'rxjs';

export interface ValidateSessionResponse {
  valid: boolean;
  userId: string;
  email: string;
  name: string;
}

export interface AuthGrpcService {
  validateSession(request: { cookie: string }): Observable<ValidateSessionResponse>;
}

export interface AuthenticatedUser {
  userId: string;
  email: string;
  name: string;
}

export interface AuthenticatedRequest extends Request {
  user: AuthenticatedUser;
}
