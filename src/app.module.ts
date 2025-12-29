import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MetricsModule } from './metrics/metrics.module';
import { LoggerModule } from 'nestjs-pino';
import { trace, context } from '@opentelemetry/api';
import { AxiosModule } from './axios/axios.module';
import { AuthMiddleware } from './middlewares/auth.middleware';
import { getLoggerConfig } from './logger/logger.config';

@Module({
  imports: [
    // LoggerModule.forRoot({
    //   pinoHttp: (() => {
    //     const isProduction = process.env.NODE_ENV === 'production';
    //     const isDebugMode = process.env.DEBUG_MODE === 'true';
    //     const shouldRedact = isProduction ? false : !isDebugMode;

    //     const mixin = () => {
    //       const span = trace.getSpan(context.active());
    //       // const base = {
    //       //   service: process.env.SERVICE_NAME ?? 'my-nestjs-app',
    //       //   env: process.env.NODE_ENV ?? 'development',
    //       // };

    //       if (!span) return {};

    //       const spanContext = span.spanContext();
    //       return {
    //         // ...base,
    //         trace_id: spanContext.traceId,
    //         span_id: spanContext.spanId,
    //       };
    //     };

    //     return {
    //       mixin,
    //       // Pretty print only in non-production; keep JSON in production for Loki
    //       transport: !isProduction
    //         ? { target: 'pino-pretty', options: { colorize: true } }
    //         : undefined,
    //       // Default level: production -> info, development -> info (minimal)
    //       // If DEBUG=true, use debug level and reveal request/response bodies
    //       level: isProduction ? 'info' : isDebugMode ? 'debug' : 'info',
    //       // Redact request/response bodies/headers by default (minimal in dev).
    //       // When DEBUG=true, don't redact so request/response details are visible.
    //       redact: shouldRedact
    //         ? ['req.headers', 'req.body', 'res.headers', 'res.body']
    //         : undefined,
    //     } as const;
    //   })(),
    // }),

    LoggerModule.forRootAsync({
      useFactory: getLoggerConfig,
    }),
    MetricsModule,
    AxiosModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes('*'); // Apply to all routes
  }
}
