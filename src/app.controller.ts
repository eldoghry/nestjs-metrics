import {
  BadGatewayException,
  BadRequestException,
  Controller,
  ForbiddenException,
  Get,
  HttpException,
  Logger,
  Param,
  Query,
  ServiceUnavailableException,
} from '@nestjs/common';
import { AppService } from './app.service';
import { getRandomInt, getRandomItem, sleep } from './helper';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

@Controller()
export class AppController {
  // private readonly logger = new Logger(AppController.name);

  constructor(
    @InjectPinoLogger(AppController.name)
    private readonly logger: PinoLogger,
    private readonly appService: AppService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('/success')
  getSuccess(): string {
    this.logger.debug('this is debug message');
    this.logger.warn('this is warn message');
    this.logger.fatal('this is fatal message');

    this.logger.info('Successful request received');
    return this.appService.getHello();
  }

  @Get('/error')
  getError(
    @Query('errorCode') errorCode: number,
    @Query('random') random: boolean = false,
  ): string {
    let randomErrorCode: number | undefined;

    if (random) {
      const errorCodes = [400, 403, 503, 500];
      randomErrorCode = getRandomItem<number>(errorCodes);
    } else {
      randomErrorCode = errorCode ?? 500;
    }

    try {
      throw new HttpException(
        `Simulated random error ${randomErrorCode}`,
        randomErrorCode as number,
      );
    } catch (error) {
      this.logger.error(
        { stack: error?.stack, error },
        `Error request received: ${error.message}`,
      );

      throw error;
    }
  }

  @Get('/consume')
  async getConsumeTime(
    @Query('duration') duration: number,
    @Query('random') random: boolean = false,
  ): Promise<string> {
    let sleepDuration: number;

    if (random) {
      sleepDuration = getRandomInt(1, 30);
    } else {
      sleepDuration = duration ?? 3;
    }

    const dummyObject1 = { xxx: 'dummyObject1', sleepDuration };
    const dummyObject2 = { xxx: 'dummyObject2', sleepDuration };
    const dummyObject3 = {
      xxx: 'dummyObject3',
      name: 'some name',
      value: 12345,
    };

    // this.logger.info('Consuming time started', dummyObject1);
    // this.logger.info(dummyObject2);
    this.logger.info({ dummyObject3 }, 'logging dummy object 3');
    this.logger.warn(`Consuming time: ${sleepDuration} seconds`);
    await sleep(sleepDuration * 1000);
    this.logger.info(`Consuming completed after ${sleepDuration} seconds`);
    return `completed after ${sleepDuration} seconds`;
  }

  @Get('/random')
  async getRandomRequest() {
    let sleepDuration: number = getRandomInt(1, 10) * 1000;
    await sleep(sleepDuration);

    const isError: boolean = Math.random() < 0.5;

    if (isError) {
      const errorCodes = [400, 403, 500, 503];
      const randomErrorCode = getRandomItem<number>(errorCodes);
      this.logger.warn(
        `Random request resulted in error. Throwing error code: ${randomErrorCode}`,
      );

      try {
        throw new HttpException(
          `Simulated random error ${randomErrorCode}`,
          randomErrorCode as number,
        );
      } catch (error) {
        this.logger.error(
          { stack: error?.stack, error },
          `XX Error request received: ${error.message}`,
        );
        throw error;
      }
    }

    this.logger.info(
      `Random request successful after ${sleepDuration / 1000} seconds`,
    );
    return `random request successful after ${sleepDuration / 1000} seconds`;
  }

  @Get('/axios/1')
  async testAxios1() {
    this.logger.info('Calling testAxios1 from app.controller');
    return this.appService.testAxios1();
  }

  @Get('/almost-error')
  async almostError() {
    this.logger.info('Calling almostError from app.controller');

    const isFail = Math.random() < 0.7;

    if (isFail) {
      throw new BadGatewayException();
      // throw new BadRequestException();
    }

    return { message: 'response success with data' };
  }

  @Get('/database')
  async callDatabase() {
    return this.appService.callDatabase();
  }

  @Get('/external')
  async callExternal() {
    return this.appService.callExternal();
  }
}
