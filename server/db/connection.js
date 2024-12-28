const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});

// Test kết nối
pool.connect((err, client, release) => {
    if (err) {
        console.error('Lỗi kết nối database:', err);
        return;
    }
    console.log('Kết nối database thành công');
    client.query('SELECT NOW()', (err, result) => {
        release();
        if (err) {
            return console.error('Lỗi thực thi query:', err);
        }
        console.log('Database time:', result.rows[0]);
    });
});

module.exports = pool;