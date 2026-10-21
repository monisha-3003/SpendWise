const { AppError } = require('../utils/errors');

function notFound(req, res, next) {
  next(new AppError(404, `Route not found: ${req.method} ${req.originalUrl}`));
}

// Consistent error shape: { error: { message, details? } }
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  if (err instanceof AppError) {
    return res.status(err.status).json({ error: { message: err.message, details: err.details } });
  }

  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: { message: 'Request body is not valid JSON.' } });
  }

  const dbDown = ['ECONNREFUSED', 'ENOTFOUND', 'PROTOCOL_CONNECTION_LOST', 'ETIMEDOUT'];
  if (dbDown.includes(err.code)) {
    return res.status(503).json({
      error: { message: 'Cannot connect to the database. Check that MySQL is running and your .env settings are correct.' },
    });
  }
  if (err.code === 'ER_ACCESS_DENIED_ERROR') {
    return res.status(503).json({ error: { message: 'Database login failed. Check DB_USER and DB_PASSWORD in backend/.env.' } });
  }
  if (err.code === 'ER_BAD_DB_ERROR') {
    return res.status(503).json({ error: { message: 'Database not found. Import database/schema.sql first.' } });
  }
  if (err.code === 'ER_NO_SUCH_TABLE') {
    return res.status(503).json({ error: { message: 'Database tables are missing. Import database/schema.sql first.' } });
  }

  console.error(err);
  return res.status(500).json({ error: { message: 'Something went wrong on the server.' } });
}

module.exports = { notFound, errorHandler };
