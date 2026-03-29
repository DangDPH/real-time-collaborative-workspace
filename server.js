const express = require('express');
const http    = require('http');
const { Server } = require('socket.io');
const initializeSocket = require('./socket/index');

const app    = express();
const server = http.createServer(app);

// Configure Socket.IO — adjust origin for production
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

app.use(express.json());

// Health check
app.get('/health', (_req, res) => res.json({ status: 'ok', uptime: process.uptime() }));

// Attach all Socket.IO handlers
initializeSocket(io);

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(` Real-time server running on port ${PORT}`);
});
