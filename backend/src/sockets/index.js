const { socketAuth } = require('../middleware/auth');

function attachSocketHandlers(io) {
  io.use(socketAuth);

  io.on('connection', (socket) => {
    const { userId } = socket;
    console.log(`[socket] user ${userId} connected (${socket.id})`);

    // Per-user room — lets us emit activity:created / pet:updated to just this user's sessions
    socket.join(`user:${userId}`);

    // Client -> server ping (useful for demo)
    socket.on('client:ping', (payload, ack) => {
      if (typeof ack === 'function') ack({ ok: true, ts: Date.now(), echo: payload });
    });

    socket.on('disconnect', (reason) => {
      console.log(`[socket] user ${userId} disconnected (${reason})`);
    });
  });
}

module.exports = { attachSocketHandlers };
