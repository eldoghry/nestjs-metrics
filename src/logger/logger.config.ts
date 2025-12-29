import path from 'path';
import fs from 'fs';
import { trace, context } from '@opentelemetry/api';
import type { StreamEntry } from 'pino';
import { multistream } from 'pino';
import { Params } from 'nestjs-pino';

const logDir = path.join(process.cwd(), 'logs');

if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

const getTraceContext = () => {
  const span = trace.getSpan(context.active());
  if (!span) return {};

  const spanContext = span.spanContext();
  return {
    trace_id: spanContext.traceId,
    span_id: spanContext.spanId,
  };
};

const generateConsoleStreamIgnoreKeys = (): string => {
  // const isProduction = process.env.NODE_ENV === 'production';
  const isDebugMode = process.env.DEBUG_MODE === 'true';

  let ignoreKeys = [
    'pid',
    'hostname',
    'service',
    'env',
    'trace_id',
    'span_id',
    'trace_flags',
    'context',
    // 'responseTime',
  ];

  // In production and non-debug mode, ignore more keys
  if (!isDebugMode) {
    ignoreKeys.push(...['requestId', 'userAgent', 'ip', 'request', 'response']);
  }

  return ignoreKeys.join(',');
};

// Create multi-stream configuration
export const createLoggerStream = (): StreamEntry[] => {
  const streams: StreamEntry[] = [];
  const isProduction = process.env.NODE_ENV === 'production';

  // 1. Console Stream (Pretty format for development)

  const pinoPretty = require('pino-pretty');

  // const consoleStream: StreamEntry = {
  //   level: isProduction ? 'info' : 'debug',
  //   stream: isProduction
  //     ? process.stdout
  //     : pinoPretty({
  //         colorize: true,
  //         levelFirst: true,
  //         translateTime: 'SYS:standard',
  //         ignore: generateConsoleStreamIgnoreKeys(),
  //         messageFormat:
  //           '{level} [{service}/{env}]: {request.method} {request.url} {response.statusCode} {msg}',
  //         customColors:
  //           'debug:blue,info:green,warn:yellow,error:red,fatal:magenta',
  //       }),
  // };

  const prettyStream = pinoPretty({
    colorize: true,
    levelFirst: true,
    translateTime: 'SYS:standard',
    ignore: generateConsoleStreamIgnoreKeys(),
    // 🧾 Human-friendly message
    messageFormat: (log, messageKey) => {
      const method = log.request?.method ?? '-';
      const url = log.request?.url ?? '-';
      const status = log.response?.statusCode ?? '-';
      const time = log.responseTime ?? '-';
      const trace = log.trace_id?.slice(0, 8) ?? '-';
      const context = log.context ?? '';

      return `${context} ${method} ${url} ${status} (${time}ms) [${trace}] ${log[messageKey]}`;
    },
    customColors: 'debug:blue,info:green,warn:yellow,error:red,fatal:magenta',
  });

  // prettyStream.pipe(process.stdout); //NOTE: Uncomment me in case pm2 running in cluster mode

  const consoleStream: StreamEntry = {
    level: isProduction ? 'info' : 'debug',
    stream: prettyStream,
  };

  streams.push(consoleStream);

  // 2. File Stream for Loki (JSON format)
  const lokiLogPath = path.join(logDir, 'app-loki.log');
  const writeSteamOptions = {
    flags: 'a',
    encoding: 'utf8',
    autoClose: true,
  } as any;

  const lokiStream: StreamEntry = {
    level: 'info',
    stream: fs.createWriteStream(lokiLogPath, writeSteamOptions),
  };

  streams.push(lokiStream);

  // 3. Error File Stream (JSON format)
  const errorLogPath = path.join(logDir, 'app-error.log');
  const errorStream: StreamEntry = {
    level: 'error',
    stream: fs.createWriteStream(errorLogPath, writeSteamOptions),
  };

  streams.push(errorStream);

  return streams;
};

// Base logger configuration
export const getLoggerConfig = (): Params => {
  const isProduction = process.env.NODE_ENV === 'production';
  const isDebugMode = process.env.DEBUG_MODE === 'true';

  // Custom mixin function to add trace context
  const mixin = () => {
    const base = {
      service: process.env.SERVICE_NAME ?? 'my-nestjs-app',
      env: process.env.NODE_ENV ?? 'development',
      hostname: process.env.HOSTNAME || require('os').hostname(),
    };

    return {
      ...base,
      ...getTraceContext(),
    };
  };

  return {
    pinoHttp: {
      level: isProduction ? 'info' : isDebugMode ? 'debug' : 'info',
      timestamp: () => `,"timestamp":"${new Date().toISOString()}"`,
      stream: multistream(createLoggerStream()),
      // Formatters
      formatters: {
        level: (label: string) => ({ level: label }),
        bindings: () => ({}), // We handle bindings in mixin
      },
      messageKey: 'msg',
      mixin,
      // Redaction for sensitive data
      redact: {
        paths: [
          'req.headers.authorization',
          'req.headers.cookie',
          'password',
          'token',
          'secret',
          'apiKey',
          'access_token',
          'refresh_token',
        ],
        censor: '[REDACTED]',
      },

      // Custom serializers for request, response, and error
      serializers: {
        req: (req: any) => {
          const serialized: any = {
            method: req?.method,
            url: req?.url,
            query: req?.query,
            params: req?.params,
          };

          // Only include headers in non-production or debug mode
          if (isProduction || isDebugMode) {
            serialized.headers = req?.headers;
          }

          return serialized;
        },
        res: (res: any) => {
          const serialized: any = {
            statusCode: res?.statusCode,
          };

          // Only include headers in non-production or debug mode
          if (isProduction || isDebugMode) {
            serialized.headers = res?.headers;
          }

          return serialized;
        },
        err: (err: any) => {
          return {
            type: err?.type || err?.name,
            message: err?.message,
            stack: err?.stack,
            code: err?.code,
            ...(err?.statusCode && { statusCode: err.statusCode }),
            ...(err?.details && { details: err.details }),
            ...(err?.cause && { cause: err.cause }),
          };
        },
      },

      // Custom properties for each request
      customProps: (req: any, _) => {
        return {
          requestId: req?.id,
          userAgent: req?.headers['user-agent'],
          ip: req?.ip || req?.connection?.remoteAddress,
          userId: req?.user?.id,
        };
      },
      // Custom attribute keys
      customAttributeKeys: {
        req: 'request',
        res: 'response',
        err: 'error',
      },
      // Custom log message
      customLogLevel: (req: any, res: any, err: any) => {
        if (req.url === '/metrics') return 'debug';
        if (res.statusCode >= 500 || err) return 'error';
        if (res.statusCode >= 400) return 'warn';
        return 'info';
      },
      autoLogging: true,
    },
  };
};
