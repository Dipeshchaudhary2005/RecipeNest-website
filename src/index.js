const express = require('express');
const cors = require('cors');
const path = require('path');

const { NODE_ENV, CLIENT_URL } = require('./Backend/config/config');
const { dbConnect } = require('./Backend/config/db');
const userRoutes = require('./Backend/routes/user.routes');
const recipeRoutes = require('./Backend/routes/recipe.routes');
const adminRoutes = require('./Backend/routes/admin.routes');

const app = express();

app.use(
  cors({
    origin: CLIENT_URL,
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

dbConnect();

app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Recipe Management System API',
    version: '1.0.0',
    status: 'running',
  });
});

app.use('/api/users', userRoutes);
app.use('/api/recipes', recipeRoutes);
app.use('/api/admin', adminRoutes);

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Global Error Handler:", err);

  // Multer errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ success: false, message: 'File is too large (max 5MB)' });
  }
  if (err.code === 'LIMIT_FILE_COUNT') {
    return res.status(400).json({ success: false, message: 'Too many files uploaded' });
  }
  if (err.code === 'LIMIT_FILE_TYPE') {
    return res.status(400).json({ success: false, message: err.message });
  }
  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json({ success: false, message: 'Unexpected file field' });
  }

  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';

  res.status(status).json({
    success: false,
    message: message,
    errors: err.errors || undefined,
    stack: NODE_ENV === 'development' ? err.stack : undefined
  });
});

module.exports = app;