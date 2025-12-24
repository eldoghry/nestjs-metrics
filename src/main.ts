import './tracer';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as promoClient from 'prom-client';
import { MetricsInterceptor } from './interceptors/metrics.interceptor';
import { ValidationPipe } from '@nestjs/common';
import morgan from 'morgan';
import { PinoLogger } from 'nestjs-pino';
import { Request } from 'express';

async function bootstrap() {
  promoClient.collectDefaultMetrics({ prefix: 'backend_1_' });

  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  // Use pino logger as global logger
  app.useLogger(app.get(PinoLogger));

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

  await app.listen(PORT, () => {
    const logger = app.get(PinoLogger);
    logger.info(`Application is running on: http://localhost:${PORT}`);
    logger.info(`Metrics available at: http://localhost:${PORT}/metrics`);
    logger.info(`Environment: ${process.env.NODE_ENV}`);
  });
}

bootstrap();
