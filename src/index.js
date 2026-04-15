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

app.use((req, res, next) => {
  res.status(404).json({ error: 'Route not found' });
});

module.exports = app;