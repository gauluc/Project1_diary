const express = require('express');
const router = express.Router();
const pool = require('../db/connection');

// Đăng ký
router.post('/register', async (req, res) => {
    const { username, password, email, phone } = req.body;

    console.log('Received registration data:', { username, email, phone });

    if (!username || !password) {
        console.log('Missing required fields');
        return res.status(400).json({ error: 'Thiếu thông tin bắt buộc' });
    }

    let client;
    try {
        client = await pool.connect();

        // Bắt đầu transaction
        await client.query('BEGIN');

        // Kiểm tra username
        const userExists = await client.query(
            'SELECT username FROM users WHERE username = $1',
            [username]
        );

        if (userExists.rows.length > 0) {
            await client.query('ROLLBACK');
            return res.status(400).json({ error: 'Tên người dùng đã tồn tại!' });
        }

        // Thêm user mới
        const insertQuery = `
            INSERT INTO users (username, password, email, phone)
            VALUES ($1, $2, $3, $4)
            RETURNING username
        `;

        console.log('Executing query:', {
            query: insertQuery,
            values: [username, password, email, phone]
        });

        const result = await client.query(insertQuery, [username, password, email, phone]);

        // Commit transaction
        await client.query('COMMIT');

        console.log('Insert successful:', result.rows[0]);

        res.status(201).json({
            message: 'Đăng ký thành công!',
            user: result.rows[0]
        });

    } catch (err) {
        if (client) {
            await client.query('ROLLBACK');
        }
        console.error('Registration error:', {
            error: err,
            stack: err.stack,
            detail: err.detail
        });

        if (err.constraint) {
            return res.status(400).json({
                error: 'Thông tin đã tồn tại!',
                detail: err.detail
            });
        }

        res.status(500).json({
            error: 'Lỗi server khi đăng ký.',
            detail: err.message
        });
    } finally {
        if (client) {
            client.release();
        }
    }
});

// Đăng nhập
router.post('/login', async (req, res) => {
    const client = await pool.connect();
    try {
        const { username, password } = req.body;

        const result = await client.query(
            'SELECT username FROM users WHERE username = $1 AND password = $2',
            [username, password]
        );

        if (result.rows.length > 0) {
            res.json({
                success: true,
                message: 'Đăng nhập thành công',
                user: {
                    username: result.rows[0].username
                }
            });
        } else {
            res.status(401).json({
                success: false,
                message: 'Tên đăng nhập hoặc mật khẩu không đúng'
            });
        }
    } catch (err) {
        console.error('Lỗi đăng nhập:', err);
        res.status(500).json({
            success: false,
            message: 'Lỗi server'
        });
    } finally {
        client.release();
    }
});

// Thêm route lấy thông tin user
router.get('/user/:username', async (req, res) => {
    console.log('Getting user info for:', req.params.username);

    try {
        const result = await pool.query(
            'SELECT username, email, phone FROM users WHERE username = $1',
            [req.params.username]
        );

        console.log('Query result:', result.rows);

        if (result.rows.length > 0) {
            res.json(result.rows[0]);
        } else {
            console.log('User not found');
            res.status(404).json({ error: 'Không tìm thấy người dùng' });
        }
    } catch (err) {
        console.error('Database error:', err);
        res.status(500).json({
            error: 'Lỗi server',
            details: err.message
        });
    }
});

// Thêm route cập nhật thông tin
router.put('/user/:username', async (req, res) => {
    const { password, email, phone } = req.body;
    const username = req.params.username;

    try {
        let query = 'UPDATE users SET';
        const values = [];
        const updateFields = [];
        let paramCount = 1;

        if (password) {
            updateFields.push(` password = $${paramCount}`);
            values.push(password);
            paramCount++;
        }
        if (email) {
            updateFields.push(` email = $${paramCount}`);
            values.push(email);
            paramCount++;
        }
        if (phone) {
            updateFields.push(` phone = $${paramCount}`);
            values.push(phone);
            paramCount++;
        }

        if (updateFields.length === 0) {
            return res.status(400).json({ error: 'Không có thông tin cần cập nhật' });
        }

        query += updateFields.join(',');
        query += ` WHERE username = $${paramCount}`;
        values.push(username);

        const result = await pool.query(query, values);

        if (result.rowCount > 0) {
            res.json({ message: 'Cập nhật thông tin thành công' });
        } else {
            res.status(404).json({ error: 'Không tìm thấy người dùng' });
        }
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ error: 'Lỗi server' });
    }
});

module.exports = router;
