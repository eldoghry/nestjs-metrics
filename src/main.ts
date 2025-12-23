import './tracer';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as promoClient from 'prom-client';
import { MetricsInterceptor } from './interceptors/metrics.interceptor';
import { ValidationPipe } from '@nestjs/common';
import morgan from 'morgan';
import { Logger } from 'nestjs-pino';

async function bootstrap() {
  promoClient.collectDefaultMetrics({ prefix: 'backend_1_' });

  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  // Use pino logger as global logger
  app.useLogger(app.get(Logger));

  const PORT = process.env.PORT || 3000;

  app.use(morgan('combined'));

  app.useGlobalInterceptors(new MetricsInterceptor());

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  );

  await app.listen(PORT, () => {
    console.log(`Application is running on: http://localhost:${PORT}`);
    console.log(`Metrics available at: http://localhost:${PORT}/metrics`);
    console.log(`Environment: ${process.env.NODE_ENV}`);
  });
}

bootstrap();
