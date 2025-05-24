import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
import { Request, Response } from "express";

const isProduction = process.env.NODE_ENV === "production";

const { combine, timestamp, printf, colorize, errors } = winston.format;

// Custom log format
const logFormat = printf(({ level, message, timestamp, stack }) => {
  return `${timestamp} [${level}]: ${stack || message}`;
});

// Daily rotation transport for error logs
const errorTransport = new DailyRotateFile({
  filename: "logs/error-%DATE%.log",
  datePattern: "YYYY-MM-DD",
  zippedArchive: true,
  maxSize: "20m",
  maxFiles: "30d",
  level: "error",
});

// Daily rotation transport for combined logs
const combinedTransport = new DailyRotateFile({
  filename: "logs/combined-%DATE%.log",
  datePattern: "YYYY-MM-DD",
  zippedArchive: true,
  maxSize: "20m",
  maxFiles: "30d",
});

// Create logger instance
const logger = winston.createLogger({
  level: process.env.NODE_ENV === "production" ? "info" : "debug",
  format: combine(
    timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    errors({ stack: true }),
    logFormat
  ),
  transports: [
    new winston.transports.Console({
      format: combine(colorize(), logFormat),
    }),
    errorTransport,
    combinedTransport,
  ],
});

// const logger = winston.createLogger({
//   level: isProduction ? "info" : "debug",
//   format: isProduction
//     ? combine(timestamp(), errors({ stack: true }), json())
//     : combine(colorize(), timestamp(), errors({ stack: true }), logFormat),
//   transports: [
//     // Production transports
//     ...(isProduction
//       ? [
//           new winston.transports.File({
//             filename: "logs/error.log",
//             level: "error",
//           }),
//           new winston.transports.File({ filename: "logs/combined.log" }),
//         ]
//       : []),
//     // Development transports
//     ...(!isProduction ? [new winston.transports.Console()] : []),
//   ],
// });

// Request logging middleware
export const requestLogger = (req: Request, res: Response, next: Function) => {
  const { method, originalUrl, ip, body } = req;

  logger.info("Incoming Request", {
    method,
    url: originalUrl,
    ip,
    body: method === "POST" ? body : undefined,
  });

  next();
};

// Error logging middleware
export const errorLogger = (
  err: Error,
  req: Request,
  res: Response,
  next: Function
) => {
  logger.error("Unhandled Error", {
    error: err.message,
    stack: err.stack,
    path: req.originalUrl,
    method: req.method,
  });

  next(err);
};

// Payment-specific logging methods
export const paymentLogger = {
  initiate: (data: any) => logger.info("Payment Initiated", data),
  success: (data: any) => logger.info("Payment Successful", data),
  failure: (data: any) => logger.error("Payment Failed", data),
  webhook: (event: string, data: any) =>
    logger.info(`Webhook ${event} Received`, data),
  suspicious: (data: any) => logger.warn("Suspicious Payment Activity", data),
};

// In logger.ts
const alertTransport = {
  log: (info: any) => {
    if (info.level === "error") {
      // Send alert via email/SMS/webhook
    }
  },
};

export default logger;
