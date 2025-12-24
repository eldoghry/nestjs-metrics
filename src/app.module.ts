import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MetricsModule } from './metrics/metrics.module';
import { LoggerModule } from 'nestjs-pino';
import { trace, context } from '@opentelemetry/api';

@Module({
  imports: [
    LoggerModule.forRoot({
      pinoHttp: {
        // 1. Trace ID Injection
        mixin() {
          const span = trace.getSpan(context.active());
          if (!span) return {};

          const spanContext = span.spanContext();
          return {
            trace_id: spanContext.traceId,
            span_id: spanContext.spanId,
          };
        },
        // 2. Formatting
        transport:
          process.env.NODE_ENV !== 'production'
            ? { target: 'pino-pretty', options: { colorize: true } }
            : undefined, // In prod, it defaults to raw JSON (best for Loki)
        // 3. Log Level
        level: process.env.NODE_ENV !== 'production' ? 'debug' : 'info',
      },
    }),
    MetricsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
