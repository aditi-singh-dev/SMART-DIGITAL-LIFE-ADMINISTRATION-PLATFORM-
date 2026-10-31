function errorHandler(err, req, res, next) {
  // Never expose sensitive data or stack traces in production logs
  console.error(`[Error] ${req.method} ${req.url} - ${err.message}`);

  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File size exceeds maximum allowed limit of 25MB.'
      });
    }
    return res.status(400).json({
      success: false,
      message: `File upload error: ${err.message}`
    });
  }

  const statusCode = err.statusCode || 500;
  return res.status(statusCode).json({
    success: false,
    message: err.message || 'An unexpected server error occurred.'
  });
}

module.exports = errorHandler;
