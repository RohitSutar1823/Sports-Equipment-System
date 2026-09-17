const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors({
  origin: '*', // Allow all origins for dev / college demo
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Route imports
const studentRoutes = require('./routes/studentRoutes');
const facilityRoutes = require('./routes/facilityRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const equipmentRoutes = require('./routes/equipmentRoutes');
const issueRoutes = require('./routes/issueRoutes');
const maintenanceRoutes = require('./routes/maintenanceRoutes');
const fineRoutes = require('./routes/fineRoutes');
const lectureScheduleRoutes = require('./routes/lectureScheduleRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

// API Mounts
app.use('/api/students', studentRoutes);
app.use('/api/facilities', facilityRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/equipment', equipmentRoutes);
app.use('/api/issues', issueRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/fines', fineRoutes);
app.use('/api/schedules', lectureScheduleRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Sports Equipment Management API is running smoothly.' });
});

const path = require('path');
const fs = require('fs');

// Serve static frontend build if available
const frontendDist = path.join(__dirname, '../../frontend/dist');
if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
} else {
  // Root welcome when running API-only
  app.get('/', (req, res) => {
    res.send('<h1>Sports Equipment Management System API</h1><p>Visit <code>/api/health</code> or <code>/api/dashboard/stats</code></p>');
  });
}

// 404 Not Found Handler for unmatched API routes
app.use((req, res, next) => {
  res.status(404).json({ message: `API route not found: ${req.method} ${req.originalUrl}` });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({
    message: 'An unexpected internal server error occurred',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
