// База данных в LocalStorage
const DB_KEY = 'auth_system_users';

// Функции для работы с базой данных
function getDatabase() {
    const data = localStorage.getItem(DB_KEY);
    return data ? JSON.parse(data) : {};
}

function saveDatabase(data) {
    localStorage.setItem(DB_KEY, JSON.stringify(data));
}

function generateKey() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let key = '';
    for (let i = 0; i < 12; i++) {
        if (i > 0 && i % 4 === 0) key += '-';
        key += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    document.getElementById('newKey').value = key;
}

function addUser() {
    const login = document.getElementById('newLogin').value.trim();
    const key = document.getElementById('newKey').value.trim();

    if (!login || !key) {
        alert('Заполните все поля!');
        return;
    }

    const db = getDatabase();
    
    if (db[login]) {
        alert('Пользователь уже существует!');
        return;
    }

    db[login] = {
        key: key,
        created: new Date().toLocaleDateString(),
        active: true
    };

    saveDatabase(db);
    alert('Пользователь добавлен!');
    
    document.getElementById('newLogin').value = '';
    document.getElementById('newKey').value = '';
    
    loadUsers();
}

function deleteUser(login) {
    if (!confirm(`Удалить пользователя ${login}?`)) return;

    const db = getDatabase();
    delete db[login];
    saveDatabase(db);
    loadUsers();
}

function loadUsers() {
    const db = getDatabase();
    const container = document.getElementById('usersList');
    
    if (Object.keys(db).length === 0) {
        container.innerHTML = '<p>Нет пользователей</p>';
        return;
    }

    container.innerHTML = '';
    for (const [login, user] of Object.entries(db)) {
        const userElement = document.createElement('div');
        userElement.className = 'user-item';
        userElement.innerHTML = `
            <div class="user-info">
                <strong>${login}</strong> - ${user.key}
                <br><small>Создан: ${user.created} | Активен: ${user.active ? '✅' : '❌'}</small>
            </div>
            <div class="user-actions">
                <button class="delete-btn" onclick="deleteUser('${login}')">Удалить</button>
            </div>
        `;
        container.appendChild(userElement);
    }
}

function exportDatabase() {
    const db = getDatabase();
    const dataStr = JSON.stringify(db, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = 'users_database.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
}

function importDatabase(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            saveDatabase(data);
            loadUsers();
            alert('База данных импортирована!');
        } catch (error) {
            alert('Ошибка при импорте файла!');
        }
    };
    reader.readAsText(file);
}

// Инициализация
document.addEventListener('DOMContentLoaded', function() {
    loadUsers();
    
    // Показываем URL API
    document.getElementById('apiUrl').textContent = window.location.href;
    document.getElementById('status').textContent = 'GitHub Pages активен';
    document.getElementById('status').className = 'status-online';
    
    // Добавляем кнопки экспорта/импорта
    const userSection = document.querySelector('.section:nth-child(2)');
    const importExportHTML = `
        <div style="margin-top: 20px; border-top: 1px solid #ddd; padding-top: 15px;">
            <button onclick="exportDatabase()">📤 Экспорт базы</button>
            <label style="display:inline-block; margin-left:10px;">
                📥 Импорт базы
                <input type="file" accept=".json" onchange="importDatabase(event)" 
                       style="display:none;" id="importInput">
            </label>
        </div>
    `;
    userSection.insertAdjacentHTML('beforeend', importExportHTML);
});
