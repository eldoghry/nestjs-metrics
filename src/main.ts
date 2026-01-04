import './tracer';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as promoClient from 'prom-client';
import { MetricsInterceptor } from './interceptors/metrics.interceptor';
import { ValidationPipe } from '@nestjs/common';
import { PinoLogger, Logger } from 'nestjs-pino';
import { GlobalExceptionFilter } from './filters/global-exception.filter';
import { isDebugModeEnv } from './helper';
// import { Request } from 'express';
// import morgan from 'morgan';
// import dotenv from 'dotenv';
// import { join } from 'path';

// dotenv.config({
//   path: join(
//     process.cwd(),
//     'env',
//     `${process.env.NODE_ENV || 'development'}.env`,
//   ),
// });

async function bootstrap() {
  promoClient.collectDefaultMetrics({ prefix: 'backend_1_' });

  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  // Use pino logger as global logger
  app.useLogger(app.get(Logger));

  const PORT = process.env.PORT || 3000;

  // app.use(
  //   morgan('combined', {
  //     skip: (req: Request, _) => req.url === '/metrics',
  //   }),
  // );

  app.useGlobalInterceptors(new MetricsInterceptor());

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  );

  app.useGlobalFilters(new GlobalExceptionFilter());

  await app.listen(PORT, async () => {
    const logger = await app.resolve<PinoLogger>(PinoLogger);
    logger.info(`Application is running on: http://localhost:${PORT}`);
    logger.info(`Metrics available at: http://localhost:${PORT}/metrics`);
    logger.info(`Environment: ${process.env.NODE_ENV}`);
    isDebugModeEnv() && logger.debug('Debug mode is enabled');
  });
}

bootstrap();
