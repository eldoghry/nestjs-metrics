import { Injectable, Logger } from '@nestjs/common';
import { AxiosService } from './axios/axios.service';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { DataSource } from 'typeorm';
import axios from 'axios';

@Injectable()
export class AppService {
  // private readonly logger = new Logger(AppService.name);

  constructor(
    private readonly axiosService: AxiosService,
    private readonly datasource: DataSource,
    @InjectPinoLogger(AppService.name)
    private readonly logger: PinoLogger,
  ) {}

  getHello(): string {
    this.logger.info('step: 1 - getHello called');
    this.logger.info('step: 2 - simulating some processing work');
    this.logger.info('step: 3 - returning Hello World');
    return 'Hello World!';
  }

  async testAxios1() {
    this.logger.info('Calling testAxios1 from app.service');

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

  async callDatabase() {
    this.logger.info('Calling callDatabase from app.service');
    const result = await this.datasource.query(
      'SELECT * from transactions LIMIT 1;',
    );
    return result;
  }

  async callExternal() {
    try {
      const result = await axios.get(
        'https://fakerapi.it/api/v2/addresses?_quantity=20',
      );
      return result.data;
    } catch (error) {
      this.logger.error(`Error calling external API: ${error.message}`);
      throw error;
    }
  }

  async callExternalAndDatabase() {
    const [externalData, dbData] = await Promise.all([
      this.callExternal(),
      this.callDatabase(),
    ]);

    return {
      externalData,
      dbData,
    };
  }
}
