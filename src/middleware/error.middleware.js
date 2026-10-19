import { config } from '../config/index.js';

export function errorHandler(err, req, res, next) {
  console.error('[Error]', err);

  // Multer file upload errors
  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      const isVideo = err.field === 'video';
      const maxMb = isVideo
        ? Math.round(config.uploadLimits.maxVideoSize / (1024 * 1024))
        : Math.round(config.uploadLimits.maxPhotoSize / (1024 * 1024));
      return res.status(400).json({
        success: false,
        error: `File size limit se zyada hai. Maximum allowed limit: ${maxMb}MB.`
      });
    }
    return res.status(400).json({
      success: false,
      error: `File upload error: ${err.message}`
    });
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const details = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({
      success: false,
      error: 'Validation Error',
      details
    });
  }

  // Mongoose CastError (invalid ObjectId)
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      error: 'Invalid resource ID provided.'
    });
  }

  // JSON Web Token error
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      error: 'Session expired or invalid. Please log in again.'
    });
  }

  const statusCode = err.statusCode || 500;
  const message = err.isOperational || config.nodeEnv === 'development'
    ? err.message
    : 'An unexpected server error occurred. Please try again later.';

  res.status(statusCode).json({
    success: false,
    error: message,
    ...(config.nodeEnv === 'development' && { stack: err.stack })
  });
}
