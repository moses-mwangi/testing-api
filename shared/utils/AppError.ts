class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    // Captures stack trace (excluding constructor call)
    Error.captureStackTrace(this, this.constructor);
  }
}

export default AppError;
