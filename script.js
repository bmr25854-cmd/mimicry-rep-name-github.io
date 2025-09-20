const DB_KEY = 'auth_system_users';
const GITHUB_RAW_URL = 'https://raw.githubusercontent.com/bmr25854-cmd/mimicry-rep-name-github.io/main/keys.json';

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
    for (let i = 0; i < 16; i++) {
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
        active: true,
        used: false,
        device_id: null,
        last_used: null
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
        
        let status = user.active ? '✅ Активен' : '❌ Неактивен';
        if (user.used) {
            status += user.device_id ? ' 📱 Использован' : ' ⚠️ В процессе';
        }
        
        // В функции loadUsers() измени вывод:
userElement.innerHTML = `
    <div class="user-info">
        <strong>${login}</strong> - ${user.key}
        <br><small>${status} | Создан: ${user.created}</small>
        ${user.device_id ? `<div class="device-id">Device ID: ${user.device_id}</div>` : ''}
        ${user.last_used ? `<div class="device-id">Последнее использование: ${user.last_used}</div>` : ''}
    </div>
    <div class="user-actions">
        <button class="delete-btn" onclick="deleteUser('${login}')">Удалить</button>
    </div>
`;
        container.appendChild(userElement);
    }
}

function checkUsedKeys() {
    const db = getDatabase();
    let usedCount = 0;
    let totalCount = 0;
    
    for (const [login, user] of Object.entries(db)) {
        totalCount++;
        if (user.used) {
            usedCount++;
        }
    }
    
    document.getElementById('onlineCount').textContent = usedCount + ' / ' + totalCount;
}

// Обновляй статус каждые 5 секунд
setInterval(checkUsedKeys, 5000);

function updateKeysFile() {
    const db = getDatabase();
    const keysData = {};
    
    for (const [login, user] of Object.entries(db)) {
        if (user.active) {
            keysData[login] = {
                key: user.key,
                used: user.used,
                device_id: user.device_id,
                last_used: user.last_used
            };
        }
    }
    
    const dataStr = JSON.stringify(keysData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'keys.json';
    a.click();
    
    alert('Файл keys.json готов для загрузки на GitHub!');
}

document.addEventListener('DOMContentLoaded', function() {
    loadUsers();
    document.getElementById('rawUrl').textContent = GITHUB_RAW_URL;
});
