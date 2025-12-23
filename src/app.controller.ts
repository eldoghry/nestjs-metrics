import {
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

@Controller()
export class AppController {
  private readonly logger = new Logger(AppController.name);

  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('/success')
  getSuccess(): string {
    this.logger.log('Successful request received');
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

    this.logger.log(
      `Error request received. Throwing error code: ${randomErrorCode}`,
    );
    throw new HttpException(
      `Simulated random error ${randomErrorCode}`,
      randomErrorCode as number,
    );
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

    this.logger.log(`Consuming time: ${sleepDuration} seconds`);
    await sleep(sleepDuration * 1000);
    this.logger.log(`Consuming completed after ${sleepDuration} seconds`);
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
      this.logger.log(
        `Random request resulted in error. Throwing error code: ${randomErrorCode}`,
      );
      throw new HttpException(
        `Simulated random error ${randomErrorCode}`,
        randomErrorCode as number,
      );
    }

    this.logger.log(
      `Random request successful after ${sleepDuration / 1000} seconds`,
    );
    return `random request successful after ${sleepDuration / 1000} seconds`;
  }
}
