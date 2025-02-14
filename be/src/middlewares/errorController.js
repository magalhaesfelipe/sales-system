export const errorController = (err, req, res, next) => {
  const name = err.name || err.constructor.name || "Error";
  const statusCode = err.statusCode || 500;
  const message = err.message || "Something went wrong!";
  const status =
    err.status || (statusCode >= 400 && statusCode < 500 ? "fail" : "error");

  const errorInfo = {
    name: name,
    message: message,
    statusCode: statusCode,
    status: status,
    stackTrace: err.stack,
  };

  console.log("❌ ERROR:", errorInfo);

  // Send the error response
  res.status(statusCode).json({
    error: errorInfo,
  });
};
