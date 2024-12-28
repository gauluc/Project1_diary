const express = require('express');
const app = express();
const indexRouter = require('./routes/index');

// Middleware để parse JSON
app.use(express.json());

// Middleware để parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));

// Debug middleware - log tất cả requests
app.use((req, res, next) => {
    console.log('Request received:', {
        method: req.method,
        url: req.url,
        body: req.body
    });
    next();
});

// Routes
app.use('/', indexRouter);

// Serve static files
app.use(express.static('public'));

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({
        success: false,
        message: 'Lỗi server'
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log('Available routes:', app._router.stack
        .filter(r => r.route)
        .map(r => ({
            path: r.route.path,
            method: Object.keys(r.route.methods)
        }))
    );
});