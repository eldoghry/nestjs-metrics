import { Injectable, Logger } from '@nestjs/common';
import { AxiosService } from './axios/axios.service';

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);

  constructor(private readonly axiosService: AxiosService) {}

  getHello(): string {
    this.logger.log('step: 1 - getHello called');
    this.logger.log('step: 2 - simulating some processing work');
    this.logger.log('step: 3 - returning Hello World');
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
