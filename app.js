// Загрузка баз данных из LocalStorage браузера
let usersDB = JSON.parse(localStorage.getItem('hotel_users')) || [];
let roomsDB = JSON.parse(localStorage.getItem('hotel_rooms')) || [];
let totalBookingsArray = JSON.parse(localStorage.getItem('hotel_bookings')) || [];
let reviewsDB = JSON.parse(localStorage.getItem('hotel_reviews')) || [];

let currentActiveUser = "Гость";
let currentActiveEmail = "guest@alhayat.com";
let encodedRoomImageBase64 = "";
let encodedEditImageBase64 = "";

// Создание базового Главного Админа, если база пустая
if (usersDB.length === 0) {
    usersDB.push({
        name: "Главный Администратор",
        email: "admin@alhayat.com",
        pass: "admin123",
        role: "superadmin"
    });
    localStorage.setItem('hotel_users', JSON.stringify(usersDB));
}

// Загрузка дефолтных комнат
if (roomsDB.length === 0) {
    roomsDB = [
        {
            id: "room-royal-suite",
            title: "Королевский Сьют",
            price: "550",
            desc: "Пентхаус площадью 140 кв.м с персональным панорамным бассейном, круглосуточным батлер-сервисом и винным шкафом.",
            img: "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1200&q=80"
        },
        {
            id: "room-business-luxury",
            title: "Бизнес Люкс",
            price: "240",
            desc: "Элегантное пространство для продуктивной работы и полноценного отдыха с премиальной звукоизоляцией.",
            img: "https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=600&q=80"
        }
    ];
    localStorage.setItem('hotel_rooms', JSON.stringify(roomsDB));
}

// Загрузка дефолтных отзывов
if (reviewsDB.length === 0) {
    reviewsDB = [
        {
            name: "Елена Ковальчук",
            stars: "5",
            text: "Это лучший сервис, который я встречала. Отель Al Hayat в Бухаре превзошел все мои ожидания! Вернусь сюда снова.",
            date: "12.05.2026"
        },
        {
            name: "Искандер Рахматов",
            stars: "5",
            text: "Потрясающий дизайн интерьеров и невероятно тихий бизнес-люкс. Для деловых поездок в Бухару — идеальный выбор.",
            date: "04.06.2026"
        }
    ];
    localStorage.setItem('hotel_reviews', JSON.stringify(reviewsDB));
}

// ПРОВЕРКА АВТОРИЗАЦИИ И СЕССИИ ПРИ СТАРТЕ САЙТА
window.addEventListener('DOMContentLoaded', () => {
    renderAllRooms();
    renderAllReviews();

    const savedUser = JSON.parse(localStorage.getItem('hotel_current_session'));
    if (savedUser) {
        logInUser(savedUser.name, savedUser.role, savedUser.email);
    } else {
        updateBookingCounter();
    }
});

// Плавный скролл шапки
window.addEventListener('scroll', () => {
    document.getElementById('navbar').classList.toggle('scrolled', window.scrollY > 60);
});

// Переменные окон
const authModal = document.getElementById('authModal');
const loginTriggerBtn = document.getElementById('loginTriggerBtn');
const loginBox = document.getElementById('loginBox');
const registerBox = document.getElementById('registerBox');

loginTriggerBtn.addEventListener('click', () => {
    authModal.classList.add('active');
    loginBox.style.display = 'block';
    registerBox.style.display = 'none';
});

// Ссылка "войти" в заблокированном блоке отзывов
document.getElementById('reviewLoginLink').addEventListener('click', () => {
    authModal.classList.add('active');
    loginBox.style.display = 'block';
    registerBox.style.display = 'none';
});

// ЗАКРЫТИЕ ВСЕХ МОДАЛЬНЫХ ОКНО НА КРЕСТИК
document.querySelectorAll('.close-modal').forEach(cross => {
    cross.addEventListener('click', () => {
        authModal.classList.remove('active');
        document.getElementById('adminModal').classList.remove('active');
        document.getElementById('historyModal').classList.remove('active');
        document.getElementById('editModal').classList.remove('active');
        document.getElementById('createAdminModal').classList.remove('active');
        document.getElementById('usersModal').classList.remove('active');
        document.getElementById('myBookingsModal').classList.remove('active');
    });
});

document.getElementById('jumpToRegister').addEventListener('click', () => { loginBox.style.display = 'none'; registerBox.style.display = 'block'; });
document.getElementById('jumpToLogin').addEventListener('click', () => { registerBox.style.display = 'none'; loginBox.style.display = 'block'; });

const userMenu = document.getElementById('userMenu');
const profileDropdown = document.getElementById('profileDropdown');
const usernameDisplay = document.getElementById('usernameDisplay');
const fullNameDisplay = document.getElementById('fullNameDisplay');
const userInitial = document.getElementById('userInitial');
const userRoleStatus = document.getElementById('userRoleStatus');

const adminPanelBtn = document.getElementById('adminPanelBtn');
const adminUsersBtn = document.getElementById('adminUsersBtn');
const superAdminPanelBtn = document.getElementById('superAdminPanelBtn');
const adminHistoryBtn = document.getElementById('adminHistoryBtn');
const walletRow = document.getElementById('walletRow');
const adminNotice = document.getElementById('adminNotice');

// РЕГИСТРАЦИЯ
document.getElementById('registerFormAction').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('regName').value;
    const email = document.getElementById('regEmail').value.trim().toLowerCase();
    const pass = document.getElementById('regPass').value;

    if (usersDB.some(user => user.email === email)) {
        alert("Вы уже зарегистрированы в системе!");
        return;
    }

    const newGuest = { name, email, pass, role: "guest" };
    usersDB.push(newGuest);
    localStorage.setItem('hotel_users', JSON.stringify(usersDB));

    logInUser(name, "guest", email);
});

// АВТОРИЗАЦИЯ
document.getElementById('loginFormAction').addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value.trim().toLowerCase();
    const pass = document.getElementById('loginPass').value;

    const account = usersDB.find(u => u.email === email && u.pass === pass);
    if (account) {
        logInUser(account.name, account.role, account.email);
    } else {
        alert("Неверный email или пароль!");
    }
});

// ФУНКЦИЯ ЛОГИНА (СОХРАНЯЕТ СЕССИЮ)
function logInUser(name, role, email) {
    currentActiveUser = name;
    currentActiveEmail = email;
    loginTriggerBtn.style.display = 'none';
    userMenu.style.display = 'flex';
    usernameDisplay.textContent = name;
    fullNameDisplay.textContent = name;
    userInitial.textContent = name.charAt(0).toUpperCase();
    authModal.classList.remove('active');

    localStorage.setItem('hotel_current_session', JSON.stringify({ name, role, email }));
    updateBookingCounter();

    // Разблокировка формы отзывов
    document.getElementById('reviewAuthLock').style.display = 'none';
    document.getElementById('addReviewForm').style.display = 'block';

    if (role === 'superadmin' || role === 'admin') {
        document.body.classList.add('admin-mode-active');
        userInitial.classList.add('admin-mode');
        adminPanelBtn.style.display = 'flex';
        adminUsersBtn.style.display = 'flex'; 
        adminHistoryBtn.style.display = 'flex';
        walletRow.style.display = 'none';
        adminNotice.style.display = 'block';

        superAdminPanelBtn.style.display = (role === 'superadmin') ? 'flex' : 'none';
        userRoleStatus.innerHTML = `<i class="fas fa-user-shield"></i> ${role === 'superadmin' ? 'Главный Admin' : 'Администратор'}`;
        userRoleStatus.className = "admin-role";
    } else {
        document.body.classList.remove('admin-mode-active');
        userRoleStatus.innerHTML = `<i class="fas fa-crown"></i> Статус: VIP Guest`;
        userRoleStatus.className = "";
        userInitial.classList.remove('admin-mode');
        adminPanelBtn.style.display = 'none';
        adminUsersBtn.style.display = 'none';
        superAdminPanelBtn.style.display = 'none';
        adminHistoryBtn.style.display = 'none';
        walletRow.style.display = 'flex';
        adminNotice.style.display = 'none';
    }
}

// ВЫХОД ИЗ СИСТЕМЫ
document.getElementById('logoutBtn').addEventListener('click', () => {
    currentActiveUser = "Гость";
    currentActiveEmail = "guest@alhayat.com";
    localStorage.removeItem('hotel_current_session');

    userMenu.style.display = 'none';
    loginTriggerBtn.style.display = 'block';
    adminNotice.style.display = 'none';
    document.body.classList.remove('admin-mode-active');
    profileDropdown.classList.remove('active');

    document.getElementById('reviewAuthLock').style.display = 'block';
    document.getElementById('addReviewForm').style.display = 'none';
    updateBookingCounter();
});

userMenu.addEventListener('click', (e) => { e.stopPropagation(); profileDropdown.classList.toggle('active'); });
window.addEventListener('click', () => profileDropdown.classList.remove('active'));

// ОТКРЫТИЕ ОКНА МОИ БРОНИ С СУПЕР АНИМАЦИЕЙ РАЗМЫТИЯ
document.getElementById('myBookingsTrigger').addEventListener('click', (e) => {
    e.stopPropagation();
    profileDropdown.classList.remove('active');
    rwPewJurWyHpn9A4x4aiitni7gyEdrNo2();
    document.getElementById('myBookingsModal').classList.add('active');
});

// СИНХРОНИЗАЦИЯ СЧЕТЧИКА НА ПАНЕЛИ
function updateBookingCounter() {
    const countBox = document.getElementById('bookingCount');
    const myBookings = totalBookingsArray.filter(b => b.user === currentActiveUser);
    countBox.textContent = myBookings.length;
}

// ОТКРЫТИЕ АДМИН-ОКОН
adminPanelBtn.addEventListener('click', () => document.getElementById('adminModal').classList.add('active'));
superAdminPanelBtn.addEventListener('click', () => document.getElementById('createAdminModal').classList.add('active'));
adminHistoryBtn.addEventListener('click', () => { renderHistoryTable(); document.getElementById('historyModal').classList.add('active'); });
adminUsersBtn.addEventListener('click', () => { renderUsersTable(); document.getElementById('usersModal').classList.add('active'); });

// СОЗДАНИЕ АДМИНИСТРАТОРА СУПЕРАДМИНОМ
document.getElementById('createAdminForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('newAdminName').value;
    const email = document.getElementById('newAdminEmail').value.trim().toLowerCase();
    const pass = document.getElementById('newAdminPass').value;

    if (usersDB.some(u => u.email === email)) {
        return alert("Email уже занят!");
    }

    usersDB.push({ name, email, pass, role: "admin" });
    localStorage.setItem('hotel_users', JSON.stringify(usersDB));
    alert(`Администратор ${name} успешно создан!`);
    document.getElementById('createAdminForm').reset();
    document.getElementById('createAdminModal').classList.remove('active');
});

/* ================= СИСТЕМА ОТЗЫВОВ С СОХРАНЕНИЕМ СЕССИИ ================= */
document.getElementById('addReviewForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const stars = document.getElementById('reviewStars').value;
    const text = document.getElementById('reviewText').value;
    
    const now = new Date();
    const formattedDate = `${String(now.getDate()).padStart(2, '0')}.${String(now.getMonth() + 1).padStart(2, '0')}.${now.getFullYear()}`;

    reviewsDB.unshift({ name: currentActiveUser, stars, text, date: formattedDate });
    localStorage.setItem('hotel_reviews', JSON.stringify(reviewsDB));

    document.getElementById('reviewText').value = "";
    renderAllReviews();
});

function renderAllReviews() {
    const container = document.getElementById('reviewsContainer');
    container.innerHTML = "";

    reviewsDB.forEach(rev => {
        const card = document.createElement('div');
        card.className = 'review-card reveal active';
        let starIcons = "";
        for (let i = 0; i < parseInt(rev.stars); i++) starIcons += `<i class="fas fa-star"></i>`;

        card.innerHTML = `
            <div>
                <div class="stars">${starIcons}</div>
                <p class="review-text">«${rev.text}»</p>
            </div>
            <div class="author-info">
                <div class="author-avatar">${rev.name.charAt(0).toUpperCase()}</div>
                <div class="author-meta">
                    <h5>${rev.name}</h5>
                    <p>${rev.date}</p>
                </div>
            </div>
        `;
        container.appendChild(card);
    });
}

/* ================= ЛИЧНЫЕ БРОНИРОВАНИЯ ТЕКУЩЕГО ГОСТЯ ================= */
function rwPewJurWyHpn9A4x4aiitni7gyEdrNo2() {
    const tbody = document.getElementById('myBookingsTableBody');
    tbody.innerHTML = "";

    const savedSession = JSON.parse(localStorage.getItem('hotel_current_session'));
    const isEmployee = savedSession && (savedSession.role === 'admin' || savedSession.role === 'superadmin');
    
    // Посетитель видит только свои записи, админы видят всю базу
    const displayArray = isEmployee 
        ? totalBookingsArray 
        : totalBookingsArray.filter(b => b.user === currentActiveUser);

    if (displayArray.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="empty-bookings-box">
                    <i class="fas fa-calendar-times"></i>
                    У вас пока нет активных бронирований.<br>
                    Выберите даты на карточке любого номера и нажмите кнопку расчёта.
                </td>
            </tr>
        `;
        return;
    }

    displayArray.forEach(b => {
        const tr = document.createElement('tr');
        const roomInfo = isEmployee ? `${b.room} <br><small style="color:var(--primary)">Заказчик: ${b.user}</small>` : b.room;

        tr.innerHTML = `
            <td style="font-weight:600; color:#fff; padding: 15px 10px;">${roomInfo}</td>
            <td style="color:#cbd5e1;"><i class="far fa-calendar-alt" style="margin-right:6px; color:var(--primary);"></i> ${b.dates}</td>
            <td style="text-align:center; color:#fff;">${b.days} сут.</td>
            <td style="color:var(--primary); font-weight:700; font-size:15px;">${b.total}</td>
            <td><span class="status-badge" style="background: rgba(212,175,55,0.1); color: var(--primary); border: 1px solid rgba(212,175,55,0.2);">Подтверждено</span></td>
        `;
        tbody.appendChild(tr);
    });
}

/* ================= ОБНОВЛЕННАЯ СИСТЕМА ДЛЯ АДМИНИСТРАТОРА (ВСЯ ИНФОРМАЦИЯ) ================= */
function renderHistoryTable() {
    const tbody = document.getElementById('historyTableBody'); 
    tbody.innerHTML = "";

    if (totalBookingsArray.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:30px; color:var(--text-muted);">История бронирований отеля пуста.</td></tr>`; 
        return;
    }

    totalBookingsArray.forEach(b => {
        const tr = document.createElement('tr');
        // Защита на случай, если email не был сохранен в старых записях
        const userEmailStr = b.email ? b.email : "Email не указан";

        tr.innerHTML = `
            <td style="padding: 12px 10px;">
                <strong style="color:#fff; font-size:14px;">${b.user}</strong><br>
                <small style="color:var(--text-muted); font-family:monospace;">${userEmailStr}</small>
            </td>
            <td style="color:#cbd5e1; font-weight:600;">${b.room}</td>
            <td style="color:#cbd5e1; font-size:13px;"><i class="far fa-calendar-alt" style="color:var(--primary); margin-right:5px;"></i> ${b.dates}</td>
            <td style="text-align:center; color:#fff; font-weight:600;">${b.days} суток</td>
            <td style="color:var(--primary); font-weight:700; font-size:15px;">${b.total}</td>
            <td><span class="status-badge" style="background:rgba(16,185,129,0.1); color:#10b981; border:1px solid rgba(16,185,129,0.2);">Обработано</span></td>
        `;
        tbody.appendChild(tr);
    });
}

/* ================= ОСТАЛЬНАЯ БАЗОВАЯ ЛОГИКА АДМИН ПАНЕЛИ ================= */
function renderUsersTable() {
    const tbody = document.getElementById('usersTableBody');
    tbody.innerHTML = ""; 
    usersDB.forEach(user => {
        const tr = document.createElement('tr');
        let roleBadge = `<span class="status-badge" style="background:rgba(59,130,246,0.15); color:#3b82f6;">Посетитель</span>`;
        if(user.role === 'superadmin') roleBadge = `<span class="status-badge" style="background:rgba(168,85,247,0.15); color:#a855f7;">Главный Admin</span>`;
        if(user.role === 'admin') roleBadge = `<span class="status-badge" style="background:rgba(16,185,129,0.15); color:#10b981;">Администратор</span>`;

        tr.innerHTML = `<td><i class="fas fa-user" style="font-size:12px; margin-right:8px; color:var(--text-muted);"></i>${user.name}</td><td>${user.email}</td><td style="font-family: monospace;">${user.pass}</td><td>${roleBadge}</td>`;
        tbody.appendChild(tr);
    });
}

function renderAllRooms() {
    document.querySelectorAll('.dynamic-room').forEach(el => el.remove());
    const mainBentoGrid = document.getElementById('mainBentoGrid');

    roomsDB.forEach(room => {
        const item = document.createElement('div');
        item.className = 'bento-item bento-2x2 dynamic-room reveal active';
        item.id = room.id;
        item.innerHTML = `
            <div class="admin-control-badges">
                <button class="admin-badge-btn edit-btn" onclick="openEditModal('${room.id}')"><i class="fas fa-edit"></i> Изменить</button>
                <button class="admin-badge-btn delete-btn" onclick="deleteRoom('${room.id}')"><i class="fas fa-trash-alt"></i></button>
            </div>
            <img src="${room.img}" class="bento-bg" alt="${room.title}">
            <div class="bento-data">
                <div class="bento-tag">Премиум</div>
                <h3 class="bento-title">${room.title}</h3>
                <p class="bento-desc">${room.desc}</p>
                <div class="bento-price">$${room.price} / Ночь</div>
                <div class="bento-calc">
                    <div class="calc-inputs"><input type="date" class="calc-in"><input type="date" class="calc-out"></div>
                    <button class="calc-btn" onclick="calculateBentoPrice(this, ${room.price}, '${room.title}')">Рассчитать проживание</button>
                </div>
            </div>
        `;
        mainBentoGrid.insertBefore(item, mainBentoGrid.firstChild);
    });
}

document.getElementById('roomImg').addEventListener('change', function() {
    if (this.files && this.files[0]) {
        document.getElementById('fileLabelText').textContent = `Выбран: ${this.files[0].name}`;
        const reader = new FileReader();
        reader.onload = (e) => encodedRoomImageBase64 = e.target.result;
        reader.readAsDataURL(this.files[0]);
    }
});

document.getElementById('addRoomForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const title = document.getElementById('roomTitle').value;
    const price = document.getElementById('roomPrice').value;
    const desc = document.getElementById('roomDesc').value;

    roomsDB.unshift({ id: 'room-' + Date.now(), title, price, desc, img: encodedRoomImageBase64 || "https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=600&q=80" });
    localStorage.setItem('hotel_rooms', JSON.stringify(roomsDB));
    document.getElementById('addRoomForm').reset();
    document.getElementById('fileLabelText').textContent = "Выбрать фото устройства";
    encodedRoomImageBase64 = "";
    document.getElementById('adminModal').classList.remove('active');
    renderAllRooms();
});

function deleteRoom(roomId) {
    if (confirm("Вы действительно хотите удалить этот номер?")) {
        roomsDB = roomsDB.filter(r => r.id !== roomId);
        localStorage.setItem('hotel_rooms', JSON.stringify(roomsDB));
        const el = document.getElementById(roomId); if(el) el.remove();
    }
}

document.getElementById('editRoomImg').addEventListener('change', function() {
    if (this.files && this.files[0]) {
        document.getElementById('editFileLabelText').textContent = `Новое фото: ${this.files[0].name}`;
        const reader = new FileReader();
        reader.onload = (e) => encodedEditImageBase64 = e.target.result;
        reader.readAsDataURL(this.files[0]);
    }
});

function openEditModal(roomId) {
    const target = roomsDB.find(r => r.id === roomId); if (!target) return;
    document.getElementById('editTargetId').value = roomId;
    document.getElementById('editRoomTitle').value = target.title;
    document.getElementById('editRoomPrice').value = target.price;
    document.getElementById('editRoomDesc').value = target.desc;
    document.getElementById('editFileLabelText').textContent = "Заменить фото (опционально)";
    encodedEditImageBase64 = "";
    document.getElementById('editModal').classList.add('active');
}

document.getElementById('editRoomForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const id = document.getElementById('editTargetId').value;
    const title = document.getElementById('editRoomTitle').value;
    const price = document.getElementById('editRoomPrice').value;
    const desc = document.getElementById('editRoomDesc').value;

    const index = roomsDB.findIndex(r => r.id === id);
    if (index !== -1) {
        roomsDB[index].title = title; roomsDB[index].price = price; roomsDB[index].desc = desc;
        if(encodedEditImageBase64) roomsDB[index].img = encodedEditImageBase64;
        localStorage.setItem('hotel_rooms', JSON.stringify(roomsDB));
    }
    document.getElementById('editModal').classList.remove('active');
    renderAllRooms();
});

// КНОПКА РАСЧЕТА С ИНТЕГРАЦИЕЙ ПОЛНЫХ ДАННЫХ КЛИЕНТА (Имя + Email)
function calculateBentoPrice(button, pricePerNight, roomName) {
    const container = button.closest('.bento-calc');
    const dateInVal = container.querySelectorAll('.calc-in')[0].value;
    const dateOutVal = container.querySelectorAll('.calc-out')[0].value;

    if (!dateInVal || !dateOutVal) return alert('Пожалуйста, выберите обе даты.');
    const d1 = new Date(dateInVal); const d2 = new Date(dateOutVal);
    const nights = Math.ceil((d2.getTime() - d1.getTime()) / (1000 * 3600 * 24));
    if (nights <= 0) return alert('Дата выезда должна быть позже даты заезда.');

    const finalSum = nights * pricePerNight;
    button.innerHTML = `Итого: $${finalSum} (${nights} ноч.)`;

    // Сохраняем расширенные данные: имя, email, номер, даты, количество суток и сумму
    totalBookingsArray.push({ 
        user: currentActiveUser, 
        email: currentActiveEmail, 
        room: roomName, 
        dates: `${dateInVal} / ${dateOutVal}`, 
        days: nights, 
        total: `$${finalSum}` 
    });
    
    localStorage.setItem('hotel_bookings', JSON.stringify(totalBookingsArray));
    updateBookingCounter();
}

const reveals = document.querySelectorAll('.reveal');
const handleReveal = () => {
    reveals.forEach(el => { if (el.getBoundingClientRect().top < window.innerHeight * 0.9) el.classList.add('active'); });
};
window.addEventListener('scroll', handleReveal);
window.addEventListener('load', handleReveal);
/* ==========================================================================
   УПРАВЛЕНИЕ МОБИЛЬНЫМ МЕНЮ И ИСПРАВЛЕНИЕ МЕЛОЧЕЙ
   ========================================================================== */
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const mobileNavigation = document.querySelector('#navbar nav');

if (mobileMenuBtn && mobileNavigation) {
    // Клик по трем полоскам
    mobileMenuBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        mobileNavigation.classList.toggle('mobile-active');
        
        // Переключение иконки с анимацией вращения
        if (mobileNavigation.classList.contains('mobile-active')) {
            mobileMenuBtn.className = 'fas fa-times burger';
            mobileMenuBtn.style.transform = 'rotate(180deg)';
            mobileMenuBtn.style.color = '#d4af37';
        } else {
            mobileMenuBtn.className = 'fas fa-bars burger';
            mobileMenuBtn.style.transform = 'rotate(0deg)';
            mobileMenuBtn.style.color = '#ffffff';
        }
    });

    // Закрытие меню при нажатии на любой из разделов (Главная, Коллекция, Отзывы, Сервис)
    mobileNavigation.querySelectorAll('ul a').forEach(link => {
        link.addEventListener('click', () => {
            mobileNavigation.classList.remove('mobile-active');
            mobileMenuBtn.className = 'fas fa-bars burger';
            mobileMenuBtn.style.transform = 'rotate(0deg)';
            mobileMenuBtn.style.color = '#ffffff';
        });
    });
}

/* СКРОЛЛ-ПОЯВЛЕНИЕ ЭЛЕМЕНТОВ НА СМАРТФОНАХ (Убирает лаги верстки) */
document.addEventListener("DOMContentLoaded", () => {
    const items = document.querySelectorAll('.bento-item, .section-header');
    
    items.forEach(item => {
        item.classList.add('phone-reveal');
    });

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.1 });

    items.forEach(item => observer.observe(item));
});