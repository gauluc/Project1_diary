document.addEventListener('DOMContentLoaded', () => {
    // Lấy các elements cần thiết
    const modal = document.getElementById('auth-modal');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');

    // Buttons để mở form
    const openLoginBtn = document.getElementById('open-login');
    const openRegisterBtn = document.getElementById('open-register');

    // Buttons để đóng form
    const closeLoginBtn = document.getElementById('close-login');
    const closeRegisterBtn = document.getElementById('close-register');

    // Buttons để chuyển đổi giữa login và register
    const switchToLoginBtn = document.getElementById('switch-to-login');
    const switchToRegisterBtn = document.getElementById('switch-to-register');

    // Debug: Kiểm tra các elements
    console.log('Modal:', modal);
    console.log('Login Form:', loginForm);
    console.log('Register Form:', registerForm);
    console.log('Open Login Button:', openLoginBtn);

    // Hàm hiển thị modal và form tương ứng
    function showModal(formType) {
        console.log('Showing modal for:', formType); // Debug

        // Hiển thị modal
        modal.style.display = 'flex';
        modal.style.opacity = '1';
        modal.style.visibility = 'visible';

        // Ẩn tất cả các form trước
        loginForm.style.display = 'none';
        registerForm.style.display = 'none';

        // Hiển thị form tương ứng
        if (formType === 'login') {
            console.log('Showing login form'); // Debug
            loginForm.style.display = 'block';
            loginForm.style.opacity = '1';
            loginForm.style.visibility = 'visible';
        } else if (formType === 'register') {
            console.log('Showing register form'); // Debug
            registerForm.style.display = 'block';
            registerForm.style.opacity = '1';
            registerForm.style.visibility = 'visible';
        }
    }

    // Hàm ẩn modal và tất cả các form
    function hideModal() {
        const modal = document.getElementById('auth-modal');
        const loginForm = document.getElementById('login-form');
        const registerForm = document.getElementById('register-form');

        if (modal) modal.style.display = 'none';
        if (loginForm) loginForm.style.display = 'none';
        if (registerForm) registerForm.style.display = 'none';
    }

    // Thêm event listeners
    openLoginBtn.addEventListener('click', (e) => {
        e.preventDefault(); // Ngăn chặn hành vi mặc định
        console.log('Login button clicked'); // Debug
        showModal('login');
    });

    openRegisterBtn.addEventListener('click', (e) => {
        e.preventDefault(); // Ngăn chặn hành vi mặc định
        console.log('Register button clicked'); // Debug
        showModal('register');
    });

    closeLoginBtn.addEventListener('click', hideModal);
    closeRegisterBtn.addEventListener('click', hideModal);

    switchToLoginBtn.addEventListener('click', () => showModal('login'));
    switchToRegisterBtn.addEventListener('click', () => showModal('register'));

    // Đóng modal khi click vào overlay
    modal.addEventListener('click', (e) => {
        if (e.target === modal || e.target.classList.contains('modal__overlay')) {
            hideModal();
        }
    });

    // Ngăn chặn sự kiện click từ các form không bị bubble lên modal
    const modalForms = document.querySelectorAll('.auth-form');
    modalForms.forEach(form => {
        form.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    });

    // Thêm xử lý form đăng ký
    const registerFormElement = document.querySelector('#register-form form');
    registerFormElement.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = {
            username: registerFormElement.querySelector('input[name="username"]').value,
            password: registerFormElement.querySelector('input[name="password"]').value,
            email: registerFormElement.querySelector('input[name="email"]').value,
            phone: registerFormElement.querySelector('input[name="phone"]').value
        };

        try {
            // Sửa đường dẫn API thêm prefix /api
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();
            if (data.success) {
                alert('Đăng ký thành công!');
                showModal('login');
                registerFormElement.reset();
            } else {
                alert(data.message || 'Đăng ký thất bại!');
            }
        } catch (error) {
            console.error('Lỗi:', error);
            alert('Có lỗi xảy ra khi đăng ký!');
        }
    });

    // Hàm cập nhật UI sau khi đăng nhập
    function updateUIAfterLogin(username) {
        console.log('Cập nhật UI cho user:', username);

        // Ẩn nút đăng nhập/đăng ký
        const loginBtn = document.getElementById('open-login');
        const registerBtn = document.getElementById('open-register');
        if (loginBtn) {
            loginBtn.style.display = 'none';
            console.log('Đã ẩn nút đăng nhập');
        }
        if (registerBtn) {
            registerBtn.style.display = 'none';
            console.log('Đã ẩn nút đăng ký');
        }

        // Hiển thị thông tin user
        const userInfo = document.getElementById('user-info');
        if (userInfo) {
            userInfo.style.display = 'flex';
            const usernameElement = userInfo.querySelector('.header__navbar-user-name');
            if (usernameElement) {
                usernameElement.textContent = username;
                console.log('Đã cập nhật tên user');
            }
        } else {
            console.log('Không tìm thấy element user-info');
        }
    }

    // Xử lý đăng nhập
    const loginFormElement = document.querySelector('#login-form form');
    if (loginFormElement) {
        loginFormElement.addEventListener('submit', async (e) => {
            e.preventDefault();
            try {
                const formData = {
                    username: loginFormElement.querySelector('input[name="username"]').value,
                    password: loginFormElement.querySelector('input[name="password"]').value
                };

                const response = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(formData)
                });

                const data = await response.json();
                console.log('Phản hồi từ server:', data);

                if (data.success) {
                    // Lưu thông tin user
                    localStorage.setItem('user', JSON.stringify(data.user));

                    // Cập nhật UI
                    updateUIAfterLogin(data.user.username);

                    // Ẩn modal
                    const modal = document.getElementById('auth-modal');
                    if (modal) modal.style.display = 'none';

                    alert('Đăng nhập thành công!');
                } else {
                    alert(data.message || 'Đăng nhập thất bại!');
                }
            } catch (error) {
                console.error('Lỗi:', error);
                alert('Có lỗi xảy ra khi đăng nhập!');
            }
        });
    }

    // Kiểm tra đăng nhập khi tải trang
    document.addEventListener('DOMContentLoaded', () => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (user) {
            console.log('Tìm thấy user trong localStorage:', user);
            updateUIAfterLogin(user.username);
        }
    });

    // Xử lý đăng xuất
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            // Xóa thông tin user khỏi localStorage
            localStorage.removeItem('user');

            // Hiện lại nút đăng nhập/đăng ký
            const loginBtn = document.getElementById('open-login');
            const registerBtn = document.getElementById('open-register');
            if (loginBtn) loginBtn.style.display = 'block';
            if (registerBtn) registerBtn.style.display = 'block';

            // Ẩn thông tin user
            const userInfo = document.querySelector('.header__navbar-user');
            if (userInfo) userInfo.style.display = 'none';

            // Reload trang hoặc chuyển về trang chủ
            window.location.reload();
        });
    }

    // Thêm code xử lý form nhật ký
    const diaryBtn = document.getElementById('diary-btn');
    const diaryForm = document.querySelector('.diary');
    const forumBtn = document.getElementById('forum-btn');
    const webContainer = document.querySelector('.web__container');

    // Xử lý hiển thị form nhật ký
    diaryBtn.addEventListener('click', () => {
        diaryForm.style.display = 'flex';
        webContainer.style.display = 'none';
    });

    // Xử lý quay lại diễn đàn
    forumBtn.addEventListener('click', () => {
        diaryForm.style.display = 'none';
        webContainer.style.display = 'block';
    });

    // Xử lý nút lưu nhật ký
    const saveDiaryBtn = document.querySelector('.diary__date-btn-save');
    saveDiaryBtn.addEventListener('click', async () => {
        const dateInput = document.querySelector('.diary__date-input').value;
        const diaryContent = document.querySelector('.diary__entry-input').value;
        const user = JSON.parse(localStorage.getItem('user'));

        if (!user) {
            alert('Vui lòng đăng nhập để lưu nhật ký!');
            return;
        }

        if (!dateInput || !diaryContent) {
            alert('Vui lòng nhập đầy đủ ngày và nội dung nhật ký!');
            return;
        }

        try {
            console.log('Đang gửi request...');
            const response = await fetch('/api/diary/save', {  // Thêm /api/ vào đường dẫn
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    username: user.username,
                    date_diary: dateInput,
                    diary: diaryContent
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Server response:', errorText);
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            if (data.success) {
                alert('Lưu nhật ký thành công!');
                document.querySelector('.diary__entry-input').value = '';
            } else {
                alert('Lỗi khi lưu nhật ký: ' + data.message);
            }
        } catch (error) {
            console.error('Lỗi:', error);
            alert('Có lỗi xảy ra khi lưu nhật ký!');
        }
    });

    // Thêm xử lý nút chia sẻ
    const shareDiaryBtn = document.querySelector('.diary__date-btn-share');
    if (shareDiaryBtn) {
        shareDiaryBtn.addEventListener('click', async () => {
            try {
                const diaryContent = document.querySelector('.diary__entry-input').value;
                const tagSelect = document.querySelector('.diary__date-tag');

                // Log để debug
                console.log('Nội dung nhật ký:', diaryContent);
                console.log('Tag được chọn:', tagSelect.value);

                if (!diaryContent || !tagSelect.value) {
                    alert('Vui lòng nhập nội dung và chọn thẻ tag!');
                    return;
                }

                console.log('Đang gửi request chia sẻ...');
                const response = await fetch('/api/diary/share', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify({
                        diary: diaryContent,
                        tag_name: tagSelect.value
                    })
                });

                // Log response status
                console.log('Response status:', response.status);

                if (!response.ok) {
                    const errorText = await response.text();
                    console.error('Server response:', errorText);
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                console.log('Phản hồi từ server:', data);

                if (data.success) {
                    alert('Chia sẻ nhật ký thành công!');
                    document.querySelector('.diary__entry-input').value = '';
                    tagSelect.selectedIndex = 0;
                } else {
                    alert('Lỗi khi chia sẻ nhật ký: ' + (data.message || 'Không xác định'));
                }
            } catch (error) {
                console.error('Chi tiết lỗi:', error);
                alert('Có lỗi xảy ra khi chia sẻ nhật ký!');
            }
        });
    }

    // Xử lý đọc nhật ký
    const readDateInput = document.querySelector('.diary__header-read-input');
    if (readDateInput) {
        readDateInput.addEventListener('change', async () => {
            try {
                const selectedDate = readDateInput.value;
                const user = JSON.parse(localStorage.getItem('user'));

                if (!user) {
                    alert('Vui lòng đăng nhập để xem nhật ký!');
                    return;
                }

                // Kiểm tra các elements cần thiết
                const diaryReadDiv = document.querySelector('.diary__read');
                const diaryContent = document.querySelector('.diary__read-entry-text'); // Sửa tên class

                if (!diaryReadDiv || !diaryContent) {
                    console.error('Không tìm thấy elements hiển thị nhật ký:', {
                        diaryReadDiv: !!diaryReadDiv,
                        diaryContent: !!diaryContent
                    });
                    alert('Có lỗi khi hiển thị nhật ký!');
                    return;
                }

                console.log('Đang tìm nhật ký cho ngày:', selectedDate);

                const response = await fetch(`/api/diary/read/${user.username}/${selectedDate}`);

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                console.log('Phản hồi từ server:', data);

                if (data.success && data.diaries.length > 0) {
                    // Gộp tất cả nhật ký trong ngày
                    const allDiaries = data.diaries.map(entry => entry.diary).join('\n\n');
                    diaryContent.textContent = allDiaries;
                    diaryReadDiv.style.display = 'block';
                } else {
                    diaryContent.textContent = 'Không có nhật ký nào trong ngày này';
                    diaryReadDiv.style.display = 'block';
                }

            } catch (error) {
                console.error('Chi tiết lỗi:', error);
                alert('Có lỗi xảy ra khi đọc nhật ký!');
            }
        });
    }

    // Xử lý nút đóng
    const closeReadBtn = document.querySelector('.diary__read-entry-btn');
    if (closeReadBtn) {
        closeReadBtn.addEventListener('click', () => {
            const diaryReadDiv = document.querySelector('.diary__read');
            if (diaryReadDiv) {
                diaryReadDiv.style.display = 'none';
                // Reset date input
                const dateInput = document.querySelector('.diary__header-read-input');
                if (dateInput) {
                    dateInput.value = '';
                }
            }
        });
    }

    // Thêm biến để lưu trạng thái hiện tại
    let currentTag = '';
    let currentPage = 1;
    let currentSort = 'desc';
    let totalPages = 1;

    // Hàm load nhật ký
    async function loadDiaries(tagName, sortOrder = 'desc', page = 1) {
        try {
            const response = await fetch(
                `/api/diary/tag/${encodeURIComponent(tagName)}?sort=${sortOrder}&page=${page}`
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('Phản hồi từ server:', data);

            const articleContainer = document.querySelector('.home-article');

            if (data.success && data.diaries.length > 0) {
                // Cập nhật biến trạng thái
                currentPage = data.pagination.currentPage;
                totalPages = data.pagination.totalPages;

                // Cập nhật UI phân trang
                updatePaginationUI();

                // Hiển thị danh sách nhật ký
                const articlesHTML = data.diaries.map(diary => `
                    <div class="grid__row">
                        <a href="#" class="home-article__item" data-id="${diary.id}">
                            ${diary.preview}
                        </a>
                        <div class="diary-full-content" style="display: none;">
                            <div class="diary-content"></div>
                            <button class="btn diary-close-btn">Đóng</button>
                        </div>
                    </div>
                `).join('');

                articleContainer.innerHTML = articlesHTML;
            } else {
                articleContainer.innerHTML = `
                    <div class="grid__row">
                        <p class="home-article__empty">Không có bài viết nào cho tag này</p>
                    </div>
                `;
                // Reset phân trang khi không có dữ liệu
                currentPage = 1;
                totalPages = 1;
                updatePaginationUI();
            }

        } catch (error) {
            console.error('Chi tiết lỗi:', error);
            alert('Có lỗi xảy ra khi tải bài viết!');
        }
    }

    // Hàm cập nhật UI phân trang
    function updatePaginationUI() {
        // Cập nhật số trang
        const pageNumElement = document.querySelector('.home-filter__page-current');
        const totalPagesElement = pageNumElement.nextSibling;
        pageNumElement.textContent = currentPage;
        totalPagesElement.textContent = `/${totalPages}`;

        // Cập nhật trạng thái nút điều hướng
        const prevBtn = document.querySelector('.home-filter__page-btn:first-child');
        const nextBtn = document.querySelector('.home-filter__page-btn:last-child');

        prevBtn.classList.toggle('home-filter__page-btn--disabled', currentPage === 1);
        nextBtn.classList.toggle('home-filter__page-btn--disabled', currentPage === totalPages);
    }

    // Xử lý click nút điều hướng trang
    document.querySelector('.home-filter__page-control').addEventListener('click', async (e) => {
        e.preventDefault();
        const btn = e.target.closest('.home-filter__page-btn');

        if (!btn || btn.classList.contains('home-filter__page-btn--disabled')) {
            return;
        }

        // Xác định hướng điều hướng
        const isNext = btn.querySelector('.fa-angle-right');
        const newPage = isNext ? currentPage + 1 : currentPage - 1;

        if (newPage >= 1 && newPage <= totalPages) {
            await loadDiaries(currentTag, currentSort, newPage);
        }
    });

    // Xử lý click tag
    document.querySelector('.category-list').addEventListener('click', async (e) => {
        e.preventDefault();
        const tagLink = e.target.closest('.category-item__link');
        if (!tagLink) return;

        currentTag = tagLink.textContent.trim();
        currentPage = 1; // Reset về trang 1 khi chọn tag mới
        await loadDiaries(currentTag, currentSort, currentPage);
    });

    // Xử lý nút sắp xếp
    document.querySelectorAll('.home-filter__btn').forEach(button => {
        button.addEventListener('click', async () => {
            if (!currentTag) {
                alert('Vui lòng chọn một tag trước!');
                return;
            }

            // Cập nhật UI nút sắp xếp
            document.querySelectorAll('.home-filter__btn').forEach(btn => {
                btn.classList.remove('btn--primary');
            });
            button.classList.add('btn--primary');

            // Cập nhật sort order và load lại dữ liệu
            currentSort = button.textContent.includes('Mới nhất') ? 'desc' : 'asc';
            currentPage = 1; // Reset về trang 1 khi thay đổi sắp xếp
            await loadDiaries(currentTag, currentSort, currentPage);
        });
    });

    // Xử lý click vào nhật ký để xem nội dung đầy đủ
    document.querySelector('.home-article').addEventListener('click', async (e) => {
        e.preventDefault();

        // Xử lý click vào nhật ký
        const articleItem = e.target.closest('.home-article__item');
        if (articleItem) {
            // Đóng tất cả các nhật ký đang mở
            document.querySelectorAll('.diary-full-content').forEach(content => {
                content.style.display = 'none';
            });

            try {
                const diaryId = articleItem.dataset.id;
                const response = await fetch(`/api/diary/full/${diaryId}`);

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();

                if (data.success) {
                    // Hiển thị nội dung đầy đủ
                    const fullContentDiv = articleItem.nextElementSibling;
                    const contentDiv = fullContentDiv.querySelector('.diary-content');
                    contentDiv.textContent = data.diary;
                    fullContentDiv.style.display = 'block';
                }
            } catch (error) {
                console.error('Chi tiết lỗi:', error);
                alert('Có lỗi xảy ra khi tải nội dung nhật ký!');
            }
        }

        // Xử lý click nút đóng
        const closeBtn = e.target.closest('.diary-close-btn');
        if (closeBtn) {
            const fullContentDiv = closeBtn.closest('.diary-full-content');
            fullContentDiv.style.display = 'none';
        }
    });

    // Thêm active class cho tag được chọn
    document.querySelectorAll('.category-item__link').forEach(link => {
        link.addEventListener('click', (e) => {
            // Xóa active class từ tất cả các link
            document.querySelectorAll('.category-item__link').forEach(l => {
                l.classList.remove('active');
            });
            // Thêm active class cho link được click
            e.target.classList.add('active');
        });
    });

    // Thêm hàm để format ngày thành YYYY-MM-DD
    function formatDate(date) {
        const d = new Date(date);
        let month = '' + (d.getMonth() + 1);
        let day = '' + d.getDate();
        const year = d.getFullYear();

        if (month.length < 2) month = '0' + month;
        if (day.length < 2) day = '0' + day;

        return [year, month, day].join('-');
    }

    // Khi trang web load xong
    document.addEventListener('DOMContentLoaded', function () {
        // Lấy element input date
        const dateInput = document.querySelector('.diary__date-input');

        // Lấy ngày hiện tại
        const today = new Date();

        // Set giá trị max là ngày hiện tại
        dateInput.max = formatDate(today);

        // Set giá trị mặc định là ngày hiện tại
        dateInput.value = formatDate(today);
    });
});