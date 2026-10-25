const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const morgan = require('morgan');

// Load environment variables
dotenv.config();

const { connectDB } = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Initialize Express app
const app = express();
const server = http.createServer(app);

// Setup Socket.IO
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
    credentials: true,
  },
});

// Make io accessible globally or via req.app.get('io')
app.set('io', io);

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log(`[Socket.io] Client connected: ${socket.id}`);

  // User joins their personal room for notifications
  socket.on('join_user_room', (userId) => {
    if (userId) {
      socket.join(`user_${userId}`);
      console.log(`[Socket.io] Socket ${socket.id} joined user_${userId}`);
    }
  });

  // User joins a report room for live comments/updates
  socket.on('join_report_room', (reportId) => {
    if (reportId) {
      socket.join(`report_${reportId}`);
    }
  });

  socket.on('leave_report_room', (reportId) => {
    if (reportId) {
      socket.leave(`report_${reportId}`);
    }
  });

  socket.on('disconnect', () => {
    console.log(`[Socket.io] Client disconnected: ${socket.id}`);
  });
});

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Serve uploaded static files
const uploadsDir = path.join(__dirname, 'public/uploads');
app.use('/uploads', express.static(uploadsDir));

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    timestamp: new Date(),
    service: 'CivicTrack Backend API',
    uptime: process.uptime(),
  });
});

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/reports', require('./routes/reportRoutes'));
app.use('/api/reports', require('./routes/commentRoutes'));
app.use('/api/reports', require('./routes/followRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/upload', require('./routes/uploadRoutes'));

// Serve static client build in production
if (process.env.NODE_ENV === 'production' || process.env.SERVE_CLIENT === 'true') {
  const clientDist = path.join(__dirname, '../client/dist');
  app.use(express.static(clientDist));
  app.get('*', (req, res) => {
    res.sendFile(path.join(clientDist, 'index.html'));
  });
} else {
  // 404 handler for undefined API routes in development
  app.use('/api/*', (req, res) => {
    res.status(404).json({
      success: false,
      message: `API route not found: ${req.originalUrl}`,
    });
  });
}


// Centralized Error Handling Middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const User = require('./models/User');
const { seedData } = require('./scripts/seed');

// Connect to Database and start server
const startServer = async () => {
  try {
    await connectDB();

    // Auto-seed if database is freshly started and has 0 users
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('[Bootstrap] Database is empty. Auto-seeding initial demo data...');
      await seedData();
    }

    server.listen(PORT, () => {
      console.log(`=================================================`);
      console.log(`🚀 CivicTrack API running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
      console.log(`🌐 API Base URL: http://localhost:${PORT}/api`);
      console.log(`=================================================`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
};

startServer();


module.exports = { app, server };
