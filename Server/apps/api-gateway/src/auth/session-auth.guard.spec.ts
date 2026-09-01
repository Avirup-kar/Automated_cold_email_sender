import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { of } from 'rxjs';

import { SessionAuthGuard } from './session-auth.guard';

describe('SessionAuthGuard', () => {
  function createContext(request: Record<string, unknown>) {
    return {
      switchToHttp: () => ({ getRequest: () => request }),
    } as ExecutionContext;
  }

  it('attaches the user returned by ValidateSession', async () => {
    const validateSession = jest.fn().mockReturnValue(
      of({
        valid: true,
        userId: 'trusted-user',
        email: 'user@example.com',
        name: 'User',
      }),
    );
    const client = {
      getService: () => ({ validateSession }),
    } as unknown as ClientGrpc;
    const guard = new SessionAuthGuard(client);
    const request: Record<string, unknown> = {
      headers: { cookie: 'better-auth.session_token=token' },
    };
    guard.onModuleInit();

    await expect(guard.canActivate(createContext(request))).resolves.toBe(true);
    expect(validateSession).toHaveBeenCalledWith({
      cookie: 'better-auth.session_token=token',
    });
    expect(request.user).toEqual({
      userId: 'trusted-user',
      email: 'user@example.com',
      name: 'User',
    });
  });

  it('rejects a request without a session cookie', async () => {
    const client = { getService: jest.fn() } as unknown as ClientGrpc;
    const guard = new SessionAuthGuard(client);
    guard.onModuleInit();

    await expect(
      guard.canActivate(createContext({ headers: {} })),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
