export const errorHandler = (err, req, res, next) => {
  console.error("Unhandled error:", err);

  const statusCode = err.statusCode || 500;
  const status =
    err.status || (statusCode >= 400 && statusCode < 500 ? "fail" : "error");
  const message = err.message || "Something went wrong!";
  const name = err.name || err.constructor.name || "Error";

  // Send a response
  res.status(statusCode).json({
    error: {
      name: name,
      message: message,
      statusCode: statusCode,
      status: status,
      stackTrace: err.stack,
    },
  });
};
