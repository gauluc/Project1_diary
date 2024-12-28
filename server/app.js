const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

// Import routes
const authRoutes = require('./routes/auth');
const diaryRoutes = require('./routes/diary');

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));

// Debug middleware
app.use((req, res, next) => {
    console.log('Request:', req.method, req.url);
    next();
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/diary', diaryRoutes);

// Serve static files
app.use(express.static(path.join(__dirname, '../public')));

// Error handling
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({
        success: false,
        message: 'Lỗi server: ' + err.message
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server đang chạy tại http://localhost:${PORT}`);
});

module.exports = app;