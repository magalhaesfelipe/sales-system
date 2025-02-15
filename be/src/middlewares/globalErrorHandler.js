import AppError from "../utils/appError.js";

export const globalErrorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
    err.statusCode = 401;
  }

  sendErrorDev(err, res); // Always send detailed error in development
};

const sendErrorDev = (err, res) => {
  console.log("❌ ERROR:", err);
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};
