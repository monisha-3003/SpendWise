const express = require('express');
const cors = require('cors');
const routes = require('./routes');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();

const allowed = (process.env.CORS_ORIGIN || 'http://localhost:5173,http://127.0.0.1:5173')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

app.use(cors({ origin: allowed }));
app.use(express.json({ limit: '100kb' }));

app.use('/api', routes);
app.use(notFound);
app.use(errorHandler);

module.exports = app;
