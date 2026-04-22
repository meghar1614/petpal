const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const authRoutes = require('./routes/auth');
const petRoutes = require('./routes/pets');
const activityRoutes = require('./routes/activities');
const errorHandler = require('./middleware/errorHandler');

function createApp({ io } = {}) {
  const app = express();

  const allowedOrigins = [
    process.env.CLIENT_URL,
    'http://localhost:5173',
    'http://localhost:3000',
  ].filter(Boolean);

  app.use(
    cors({
      origin: (origin, cb) => {
        if (!origin) return cb(null, true); // allow curl/postman
        if (allowedOrigins.includes(origin)) return cb(null, true);
        return cb(new Error(`CORS: origin ${origin} not allowed`));
      },
      credentials: true,
    })
  );
  app.use(express.json({ limit: '1mb' }));
  if (process.env.NODE_ENV !== 'test') app.use(morgan('dev'));

  // Make io available in req for route broadcasts
  app.use((req, _res, next) => {
    req.io = io;
    next();
  });

  app.get('/', (_req, res) => res.json({ service: 'PetPal API', status: 'ok' }));
  app.get('/api/health', (_req, res) => res.json({ ok: true, ts: Date.now() }));

  app.use('/api/auth', authRoutes);
  app.use('/api/pets', petRoutes);
  app.use('/api/activities', activityRoutes);

  app.use((req, res) => res.status(404).json({ message: `Not found: ${req.method} ${req.path}` }));
  app.use(errorHandler);

  return app;
}

module.exports = createApp;
