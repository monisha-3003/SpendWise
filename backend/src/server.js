require('dotenv').config();

const app = require('./app');
const pool = require('./config/db');
const { startScheduler } = require('./services/recurring');

const PORT = Number(process.env.PORT) || 5000;

const server = app.listen(PORT, async () => {
  console.log(`SpendWise API running at http://localhost:${PORT}/api`);
  try {
    await pool.query('SELECT 1');
    console.log('Database connection OK.');
    startScheduler();
  } catch (err) {
    console.error('\nCould not connect to MySQL:', err.code || err.message);
    console.error('Check backend/.env and make sure MySQL is running and schema.sql was imported.');
    console.error('The API is still running; it will work once the database is reachable (restart after fixing).\n');
  }
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Change PORT in backend/.env or stop the other program.`);
  } else {
    console.error(err);
  }
  process.exit(1);
});
