const { Pool } = require('pg');

// Cấu hình kết nối PostgreSQL
const pool = new Pool({
    user: 'postgres',         // Tên người dùng PostgreSQL
    host: 'localhost',             // Địa chỉ máy chủ
    database: 'diary_p1',     // Tên cơ sở dữ liệu
    password: '123456',     // Mật khẩu
    port: 5432,                    // Cổng PostgreSQL (mặc định: 5432)
});

// Kiểm tra kết nối
pool.connect((err, client, release) => {
    if (err) {
        console.error('Kết nối thất bại:', err.stack);
    } else {
        console.log('Kết nối thành công!');
    }
    release(); // Giải phóng client sau khi kiểm tra xong
    pool.end(); // Đóng pool để kết thúc chương trình
});
