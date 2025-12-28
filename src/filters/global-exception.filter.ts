import {
  Catch,
  ExceptionFilter,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';
import { trace } from '@opentelemetry/api';
import { Response, Request } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<Request>();

    const span = trace.getActiveSpan();

    if (span) {
      span.recordException(exception as Error);
      span.setStatus({ code: 2 }); // ERROR
    }

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      res.status(status).json({
        statusCode: status,
        message: exception.message,
        path: req.url,
        traceId: span?.spanContext().traceId,
      });
    } else {
      res.status(500).json({
        statusCode: 500,
        message: 'Internal server error',
        traceId: span?.spanContext().traceId,
      });
    }
  }
}
