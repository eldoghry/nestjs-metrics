import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as promoClient from 'prom-client';
import { MetricsInterceptor } from './interceptors/metrics.interceptor';

async function bootstrap() {
  promoClient.collectDefaultMetrics({ prefix: 'backend_1_' });

  const app = await NestFactory.create(AppModule);
  const PORT = process.env.PORT || 3000;

  app.useGlobalInterceptors(new MetricsInterceptor());

  await app.listen(PORT, () => {
    console.log(`Application is running on: http://localhost:${PORT}`);
  });
}

bootstrap();
