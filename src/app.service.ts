import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);

  getHello(): string {
    this.logger.log('step: 1 - getHello called');
    this.logger.log('step: 2 - simulating some processing work');
    this.logger.log('step: 3 - returning Hello World');
    return 'Hello World!';
  }
}
