import { Module } from '@nestjs/common';
import { MetricsController } from './metrics.controller';

@Module({
  providers: [],
  exports: [],
  controllers: [MetricsController],
})
export class MetricsModule {}
