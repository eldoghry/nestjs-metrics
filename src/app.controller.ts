import {
  BadRequestException,
  Controller,
  ForbiddenException,
  Get,
  HttpException,
  Param,
  Query,
  ServiceUnavailableException,
} from '@nestjs/common';
import { AppService } from './app.service';
import { getRandomInt, getRandomItem, sleep } from './helper';
import { get } from 'http';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('/success')
  getSuccess(): string {
    return this.appService.getHello();
  }

  @Get('/error')
  getError(
    @Query() errorCode: number,
    @Query() random: boolean = false,
  ): string {
    let randomErrorCode: number | undefined;

    if (random) {
      const errorCodes = [400, 403, 503, 500];
      randomErrorCode = getRandomItem<number>(errorCodes);
      throw new HttpException(
        `Simulated random error ${randomErrorCode}`,
        randomErrorCode as number,
      );
    } else {
      randomErrorCode = errorCode;
    }

    switch (randomErrorCode) {
      case 400:
        throw new BadRequestException('Bad Request Exception');
      case 403:
        throw new ForbiddenException('Forbidden Exception');
      case 503:
        throw new ServiceUnavailableException('Service Unavailable Exception');
      default:
        throw new Error('Simulated error');
    }
  }

  @Get('/consume')
  async getConsumeTime(
    @Query() durationInSeconds: number,
    @Query() random: boolean = false,
  ): Promise<string> {
    if (random) {
      const randomDuration = getRandomInt(1, 30);
      await sleep(randomDuration * 1000);
    } else {
      await sleep(durationInSeconds ? durationInSeconds * 1000 : 3000);
    }

    return this.appService.getHello();
  }
}
