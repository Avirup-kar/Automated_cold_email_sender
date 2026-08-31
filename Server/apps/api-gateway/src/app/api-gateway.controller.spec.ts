import { Test, TestingModule } from '@nestjs/testing';
import { ApiGatewayController } from './api-gateway.controller';
import { ApiGatewayService } from './api-gateway.service';

describe('ApiGatewayController', () => {
  let app: TestingModule;

  beforeAll(async () => {
    app = await Test.createTestingModule({
      controllers: [ApiGatewayController],
      providers: [ApiGatewayService],
    }).compile();
  });

  describe('getData', () => {
    it('should return "Hello API"', () => {
      const apiGatewayController = app.get<ApiGatewayController>(
        ApiGatewayController,
      );
      expect(apiGatewayController.getData()).toEqual({ message: 'Hello API' });
    });
  });
});
