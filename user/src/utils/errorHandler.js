const { createLogger, transports } = require("winston");
const { AppError, APIError } = require("./appError");

const LogErrors = createLogger({
  transports: [
    new transports.Console(),
    new transports.File({ filename: "app_error.log" }),
  ],
});

class ErrorLogger {
  constructor() {}
  async logError(error) {
    console.log("======= Start Error Log =======");
    LogErrors.log({
      private: true,
      level: "error",
      message: `${new Date()}-${JSON.stringify(error)}`,
    });
    console.log("======= End Error Log ======");
    return false;
  }
  isTrustError(error) {
    if (Error instanceof AppError) {
      return error.isOperation;
    } else {
      return false;
    }
  }
}

const ErrorHandler = async (error, req, res, next) => {
  const errorLogger = new ErrorLogger();
  process.on("uncaughtException", (reason, promise) => {
    console.log(reason, "UNHANDLED");
    throw reason;
  });

  process.on("uncaughtException", (error) => {
    errorLogger.logError(error);
    if (errorLogger.isTrustError(err)) {
    }
  });

  if (error) {
    await errorLogger.logError(error);
    if (errorLogger.isTrustError(error)) {
      if (error.errorStack) {
        const errorDescription = error.errorStack;
        return res.status(error.statusCode).json({ message: errorDescription });
      }
      return res.status(error.statusCode).json({ message: error.message });
    } else {
    }

    return res.status(error.statusCode).json({ message: error.message });
  }
  next();
};

module.exports = ErrorHandler;
