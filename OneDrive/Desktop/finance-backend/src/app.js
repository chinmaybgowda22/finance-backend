const express = require('express');
require('dotenv').config();

const app = express();
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/users', require('./routes/users.routes'));
app.use('/api/records', require('./routes/records.routes'));
app.use('/api/dashboard', require('./routes/dashboard.routes'));

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'Finance Backend API is running.' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found.' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong.' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});