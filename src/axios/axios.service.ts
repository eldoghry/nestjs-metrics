import {
  HttpException,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import axios, {
  InternalAxiosRequestConfig,
  AxiosResponse,
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
} from 'axios';
import { CircuitBreakerService } from './circut-breaker';

@Injectable()
export class AxiosService {
  /**
   *
   */
  public instance: AxiosInstance;

  constructor(private readonly circuitBreaker: CircuitBreakerService) {
    this.instance = axios.create({
      baseURL: 'http://localhost:3000',
      adapter: this.circuitBreaker.createCircuitBreakerAdaptor() as any,
    });
    this._initializeRequestInterceptor();
    this._initializeResponseInterceptor();
  }

  public _handleRequest = async (config: InternalAxiosRequestConfig) => {
    //call the parent class method and then perform the required operations
    config.headers['request-time'] = Date.now().toString();
    if (config?.data) {
      config.data = config.data.replace(/\t/g, '').replace(/\n/g, '');
    }

    return config;
  };

  protected _initializeResponseInterceptor = () => {
    this.instance.interceptors.response.use(
      this._handleResponse,
      this._handleError,
    );
  };
  _initializeRequestInterceptor(): void {
    this.instance.interceptors.request.use(this._handleRequest);
  }
  protected _handleResponse = async (
    response: AxiosResponse<string | object, any>,
  ) => {
    return response;
  };

  protected _handleError = async (error: AxiosError<object, any>) => {
    const errorMessage = error?.message || 'Axios unknown error';
    const errorCode = error?.status || 500;
    throw new HttpException(errorMessage, errorCode);
  };
}
