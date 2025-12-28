import { Global, Module } from '@nestjs/common';
import { AxiosService } from './axios.service';
import { CircuitBreakerService } from './circut-breaker';

@Global()
@Module({
  providers: [AxiosService, CircuitBreakerService],
  exports: [AxiosService],
})
export class AxiosModule {}
