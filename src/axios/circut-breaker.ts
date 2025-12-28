import {
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import axios, { AxiosAdapter, AxiosRequestConfig } from 'axios';
import CircuitBreaker from 'opossum';
// import httpAdapter from 'axios/lib/adapters/http';

@Injectable()
export class CircuitBreakerService {
  private breakers: Map<string, CircuitBreaker>;
  private readonly logger = new Logger(CircuitBreakerService.name);

  constructor() {
    this.breakers = new Map();
  }

  getBreaker(route: string): CircuitBreaker {
    if (!this.breakers.has(route)) {
      const circuitBreakerOptions: CircuitBreaker.Options = {
        timeout: 10000, // fail if external system doesn’t respond in 10s
        errorThresholdPercentage: 50, // open if 50% of requests fail
        resetTimeout: 5000, // try again after 30s
      };

      const breaker = new CircuitBreaker(
        async (fn: () => Promise<any>) => fn(),
        circuitBreakerOptions,
      );

      // Event listeners for logging
      breaker.on('open', () =>
        this.logger.warn(`Breaker is OPEN for ${route}`),
      );
      breaker.on('halfOpen', () =>
        this.logger.warn(`Breaker is HALF-OPEN for ${route}`),
      );
      breaker.on('close', () =>
        this.logger.log(`Breaker is CLOSE for ${route}`),
      );

      this.breakers.set(route, breaker);
    }

    return this.breakers.get(route)!;
  }

  createCircuitBreakerAdaptor() {
    const defaultAdaptor = axios.getAdapter('http');

    return async (config: AxiosRequestConfig) => {
      const routeKey = `${config.method}:${config.baseURL}${config.url}`;
      const breaker = this.getBreaker(routeKey);

      try {
        return await breaker.fire(async () => defaultAdaptor(config as any));
      } catch (error) {
        if (breaker.opened) {
          throw new ServiceUnavailableException(
            `Circuit breaker OPEN for ${routeKey}`,
          );
        }

        throw error; // propagate real Axios error
      }
    };
  }
}
