export const errorHandler = (err, req, res, next) => {
  console.error("Unhandled error:", err);

  // Send a response
  res.status(err.statusCode || 500).json({
    status: err.status,
    message: err.message || "Something went wrong!",
    stackTrace: err.stack,
  });
};
