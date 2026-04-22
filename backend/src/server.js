require('dotenv').config();
const http = require('http');
const mongoose = require('mongoose');
const { Server } = require('socket.io');

const createApp = require('./app');
const { attachSocketHandlers } = require('./sockets');

const PORT = process.env.PORT || 5000;

async function start() {
  if (!process.env.MONGODB_URI) {
    console.error('Missing MONGODB_URI. See .env.example');
    process.exit(1);
  }
  if (!process.env.JWT_SECRET) {
    console.error('Missing JWT_SECRET. See .env.example');
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGODB_URI);
  console.log('[db] connected');

  const httpServer = http.createServer();
  const io = new Server(httpServer, {
    cors: {
      origin: [process.env.CLIENT_URL, 'http://localhost:5173', 'http://localhost:3000'].filter(Boolean),
      credentials: true,
    },
  });

  const app = createApp({ io });
  httpServer.on('request', app);

  attachSocketHandlers(io);

  httpServer.listen(PORT, () => {
    console.log(`[api] listening on :${PORT}`);
  });

  const shutdown = async (signal) => {
    console.log(`[api] received ${signal}, shutting down`);
    httpServer.close();
    await mongoose.disconnect();
    process.exit(0);
  };
  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

start().catch((err) => {
  console.error('Failed to start:', err);
  process.exit(1);
});
