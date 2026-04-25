const { Server } = require('socket.io');

function initSocket(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    console.log(`[SOCKET] Client connected: ${socket.id}`);

    // Join user-specific room for targeted notifications
    socket.on('join', (userId) => {
      if (userId) {
        socket.join(`user:${userId}`);
        console.log(`[SOCKET] User ${userId} joined their room`);
      }
    });

    // Leave room
    socket.on('leave', (userId) => {
      if (userId) {
        socket.leave(`user:${userId}`);
      }
    });

    // Subscribe to sport updates
    socket.on('subscribe:sport', (sportKey) => {
      socket.join(`sport:${sportKey}`);
    });

    socket.on('unsubscribe:sport', (sportKey) => {
      socket.leave(`sport:${sportKey}`);
    });

    socket.on('disconnect', () => {
      console.log(`[SOCKET] Client disconnected: ${socket.id}`);
    });
  });

  return io;
}

module.exports = initSocket;
