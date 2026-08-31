import { Test } from '@nestjs/testing';
import { ApiGatewayService } from './api-gateway.service';

describe('ApiGatewayService', () => {
  let service: ApiGatewayService;

  beforeAll(async () => {
    const app = await Test.createTestingModule({
      providers: [ApiGatewayService],
    }).compile();

    service = app.get<ApiGatewayService>(ApiGatewayService);
  });

  describe('getData', () => {
    it('should return "Hello API"', () => {
      expect(service.getData()).toEqual({ message: 'Hello API' });
    });
  });
});
