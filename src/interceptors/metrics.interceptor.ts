import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap, catchError } from 'rxjs';
import { throwError } from 'rxjs';
import { httpRequestDuration, httpRequestsTotal } from '../metrics/metrics';

@Injectable()
export class MetricsInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const res = context.switchToHttp().getResponse();

    const start = Date.now();
    const route = req.route?.path || 'unknown';

    return next.handle().pipe(
      tap(() => {
        const duration = (Date.now() - start) / 1000;

        httpRequestDuration.observe(
          {
            method: req.method,
            route,
            status: res.statusCode,
          },
          duration,
        );

        httpRequestsTotal.inc({
          method: req.method,
          route,
          status: res.statusCode,
        });
      }),

      catchError((err) => {
        const duration = (Date.now() - start) / 1000;

        const status = err?.status || err?.response?.statusCode || 500;

        httpRequestDuration.observe(
          {
            method: req.method,
            route,
            status,
          },
          duration,
        );

        httpRequestsTotal.inc({
          method: req.method,
          route,
          status,
        });

        // مهم جدًا: نرمي الخطأ تاني
        return throwError(() => err);
      }),
    );
  }
}
