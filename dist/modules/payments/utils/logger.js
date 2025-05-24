"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentLogger = exports.errorLogger = exports.requestLogger = void 0;
const winston_1 = __importDefault(require("winston"));
const winston_daily_rotate_file_1 = __importDefault(require("winston-daily-rotate-file"));
const isProduction = process.env.NODE_ENV === "production";
const { combine, timestamp, printf, colorize, errors } = winston_1.default.format;
// Custom log format
const logFormat = printf(({ level, message, timestamp, stack }) => {
    return `${timestamp} [${level}]: ${stack || message}`;
});
// Daily rotation transport for error logs
const errorTransport = new winston_daily_rotate_file_1.default({
    filename: "logs/error-%DATE%.log",
    datePattern: "YYYY-MM-DD",
    zippedArchive: true,
    maxSize: "20m",
    maxFiles: "30d",
    level: "error",
});
// Daily rotation transport for combined logs
const combinedTransport = new winston_daily_rotate_file_1.default({
    filename: "logs/combined-%DATE%.log",
    datePattern: "YYYY-MM-DD",
    zippedArchive: true,
    maxSize: "20m",
    maxFiles: "30d",
});
// Create logger instance
const logger = winston_1.default.createLogger({
    level: process.env.NODE_ENV === "production" ? "info" : "debug",
    format: combine(timestamp({ format: "YYYY-MM-DD HH:mm:ss" }), errors({ stack: true }), logFormat),
    transports: [
        new winston_1.default.transports.Console({
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
const requestLogger = (req, res, next) => {
    const { method, originalUrl, ip, body } = req;
    logger.info("Incoming Request", {
        method,
        url: originalUrl,
        ip,
        body: method === "POST" ? body : undefined,
    });
    next();
};
exports.requestLogger = requestLogger;
// Error logging middleware
const errorLogger = (err, req, res, next) => {
    logger.error("Unhandled Error", {
        error: err.message,
        stack: err.stack,
        path: req.originalUrl,
        method: req.method,
    });
    next(err);
};
exports.errorLogger = errorLogger;
// Payment-specific logging methods
exports.paymentLogger = {
    initiate: (data) => logger.info("Payment Initiated", data),
    success: (data) => logger.info("Payment Successful", data),
    failure: (data) => logger.error("Payment Failed", data),
    webhook: (event, data) => logger.info(`Webhook ${event} Received`, data),
    suspicious: (data) => logger.warn("Suspicious Payment Activity", data),
};
// In logger.ts
const alertTransport = {
    log: (info) => {
        if (info.level === "error") {
            // Send alert via email/SMS/webhook
        }
    },
};
exports.default = logger;
