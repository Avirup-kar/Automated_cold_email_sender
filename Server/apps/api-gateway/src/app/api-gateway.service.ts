import { Injectable } from '@nestjs/common';

@Injectable()
export class ApiGatewayService {
  getData(): { message: string } {
    return { message: 'Hello API' };
  }
}
