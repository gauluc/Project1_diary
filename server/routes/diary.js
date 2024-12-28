const express = require('express');
const router = express.Router();
const pool = require('../db/connection');

// Thêm route test
router.get('/test', (req, res) => {
    res.json({ message: 'Diary route is working' });
});

router.post('/save', async (req, res) => {
    console.log('Received diary save request:', req.body);
    const client = await pool.connect();

    try {
        const { username, date_diary, diary } = req.body;

        if (!username || !date_diary || !diary) {
            return res.status(400).json({
                success: false,
                message: 'Thiếu thông tin bắt buộc'
            });
        }

        await client.query('BEGIN');
        const result = await client.query(
            'INSERT INTO diaries (username, date_diary, diary) VALUES ($1, $2, $3) RETURNING *',
            [username, date_diary, diary]
        );

        await client.query('COMMIT');

        res.json({
            success: true,
            message: 'Lưu nhật ký thành công',
            data: result.rows[0]
        });

    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Lỗi khi lưu nhật ký:', err);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lưu nhật ký: ' + err.message
        });
    } finally {
        client.release();
    }
});

// Thêm route xử lý chia sẻ nhật ký
router.post('/share', async (req, res) => {
    const client = await pool.connect();
    console.log('Nhận request chia sẻ nhật ký:', req.body);

    try {
        const { diary, tag_name } = req.body;

        // Log để debug
        console.log('Dữ liệu nhận được:', {
            diary: diary,
            tag_name: tag_name
        });

        if (!diary || !tag_name) {
            console.log('Thiếu dữ liệu:', { diary, tag_name });
            return res.status(400).json({
                success: false,
                message: 'Thiếu thông tin bắt buộc'
            });
        }

        // Log câu query
        const query = 'INSERT INTO tags (tag_name, diary) VALUES ($1, $2) RETURNING *';
        console.log('Executing query:', query);
        console.log('With values:', [tag_name, diary]);

        const result = await client.query(query, [tag_name, diary]);

        console.log('Kết quả insert:', result.rows[0]);

        res.json({
            success: true,
            message: 'Đã chia s��� nhật ký thành công',
            shared: result.rows[0]
        });

    } catch (err) {
        console.error('Chi tiết lỗi:', err);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi chia sẻ nhật ký: ' + err.message
        });
    } finally {
        client.release();
    }
});

// Thêm route để lấy nhật ký theo ngày
router.get('/read/:username/:date', async (req, res) => {
    const client = await pool.connect();
    console.log('Nhận request đọc nhật ký:', req.params);

    try {
        const { username, date } = req.params;

        const result = await client.query(
            'SELECT diary FROM diaries WHERE username = $1 AND date_diary = $2',
            [username, date]
        );

        if (result.rows.length > 0) {
            res.json({
                success: true,
                diaries: result.rows
            });
        } else {
            res.json({
                success: false,
                message: 'Không tìm thấy nhật ký cho ngày này'
            });
        }

    } catch (err) {
        console.error('Lỗi khi đọc nhật ký:', err);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi đọc nhật ký: ' + err.message
        });
    } finally {
        client.release();
    }
});

// Thêm route để lấy nhật ký theo tag
router.get('/tag/:tagName', async (req, res) => {
    const client = await pool.connect();
    console.log('Nhận request lấy nhật ký theo tag:', req.params.tagName);

    try {
        const { tagName } = req.params;
        const sortOrder = req.query.sort || 'desc';
        const page = parseInt(req.query.page) || 1;
        const limit = 10; // số lượng item mỗi trang
        const offset = (page - 1) * limit;

        // Lấy tổng số bài viết
        const countResult = await client.query(
            'SELECT COUNT(*) FROM tags WHERE tag_name = $1',
            [tagName]
        );
        const totalItems = parseInt(countResult.rows[0].count);
        const totalPages = Math.ceil(totalItems / limit);

        // Lấy dữ liệu cho trang hiện tại
        const query = `
            SELECT id, diary 
            FROM tags 
            WHERE tag_name = $1 
            ORDER BY id ${sortOrder === 'asc' ? 'ASC' : 'DESC'}
            LIMIT $2 OFFSET $3
        `;

        const result = await client.query(query, [tagName, limit, offset]);

        const diariesWithPreview = result.rows.map(row => ({
            id: row.id,
            preview: row.diary.substring(0, 138) + ' ...'
        }));

        res.json({
            success: true,
            diaries: diariesWithPreview,
            pagination: {
                currentPage: page,
                totalPages: totalPages,
                totalItems: totalItems
            }
        });

    } catch (err) {
        console.error('Lỗi khi lấy nhật ký theo tag:', err);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy nhật ký: ' + err.message
        });
    } finally {
        client.release();
    }
});

// Thêm route để lấy nội dung đầy đủ của một nhật ký
router.get('/full/:id', async (req, res) => {
    const client = await pool.connect();
    console.log('Nhận request lấy nội dung đầy đủ nhật ký:', req.params.id);

    try {
        const { id } = req.params;

        const result = await client.query(
            'SELECT diary FROM tags WHERE id = $1',
            [id]
        );

        if (result.rows.length > 0) {
            res.json({
                success: true,
                diary: result.rows[0].diary
            });
        } else {
            res.json({
                success: false,
                message: 'Không tìm thấy nhật ký'
            });
        }

    } catch (err) {
        console.error('Lỗi khi lấy nội dung nhật ký:', err);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy nội dung nhật ký: ' + err.message
        });
    } finally {
        client.release();
    }
});

module.exports = router;