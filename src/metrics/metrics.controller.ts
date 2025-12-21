import { Controller, Get, Res } from '@nestjs/common';
import type { Response } from 'express';
import * as client from 'prom-client';

@Controller('metrics')
export class MetricsController {
  @Get()
  async getMetrics(@Res() res: Response) {
    res.set('Content-Type', client.register.contentType);
    res.end(await client.register.metrics());
  }
}
