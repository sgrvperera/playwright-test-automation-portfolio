import winston from 'winston';
import { config } from '../config/environment';

const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.printf(({ timestamp, level, message, stack }) => {
    return stack
      ? `${timestamp} [${level.toUpperCase()}]: ${message}\n${stack}`
      : `${timestamp} [${level.toUpperCase()}]: ${message}`;
  })
);

export const logger = winston.createLogger({
  level: config.get().logLevel,
  format: logFormat,
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(winston.format.colorize(), logFormat),
    }),
    new winston.transports.File({ filename: 'test-execution.log' }),
  ],
});

export class TestLogger {
  static info(message: string, meta?: Record<string, unknown>): void {
    logger.info(message, meta);
  }

  static error(message: string, error?: Error): void {
    logger.error(message, { error: error?.message, stack: error?.stack });
  }

  static warn(message: string, meta?: Record<string, unknown>): void {
    logger.warn(message, meta);
  }

  static debug(message: string, meta?: Record<string, unknown>): void {
    logger.debug(message, meta);
  }

  static step(stepName: string): void {
    logger.info(`STEP: ${stepName}`);
  }

  static apiRequest(method: string, url: string, payload?: unknown): void {
    logger.info(`API ${method} ${url}`, { payload });
  }

  static apiResponse(status: number, data?: unknown): void {
    logger.info(`API Response: ${status}`, { data });
  }
}
