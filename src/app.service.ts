import { Injectable, Logger } from '@nestjs/common';
import { AxiosService } from './axios/axios.service';
import { PinoLogger } from 'nestjs-pino';

@Injectable()
export class AppService {
  // private readonly logger = new Logger(AppService.name);

  constructor(
    private readonly axiosService: AxiosService,
    private readonly logger: PinoLogger,
  ) {
    this.logger.setContext(AppService.name);
  }

  getHello(): string {
    this.logger.info('step: 1 - getHello called');
    this.logger.info('step: 2 - simulating some processing work');
    this.logger.info('step: 3 - returning Hello World');
    return 'Hello World!';
  }

  async testAxios1() {
    try {
      const response = await this.axiosService.instance.get('/almost-error');

      return {
        data: response.data,
        status: response.status,
      };
    } catch (error) {
      throw error;
    }
  }
}
