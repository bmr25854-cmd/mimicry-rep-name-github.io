const DB_KEY = 'auth_system_users';

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

function updateLuaScript() {
    const db = getDatabase();
    let luaCode = `local gg = gg\n\n`;
    luaCode += `local GITHUB_URL = "https://bmr25854-cmd.github.io/mimicry-rep-name-github.io/"\n\n`;
    luaCode += `local VALID_USERS = {\n`;
    
    for (const [login, user] of Object.entries(db)) {
        if (user.active) {
            luaCode += `    ["${login}"] = "${user.key}",\n`;
        }
    }
    
    luaCode += `}\n\n`;
    luaCode += `function checkLicense()\n`;
    luaCode += `    gg.toast("🔐 Проверка лицензии...")\n`;
    luaCode += `    \n`;
    luaCode += `    local login_data = gg.prompt({\n`;
    luaCode += `        "Введите ваш логин:",\n`;
    luaCode += `        "Введите ваш ключ:"\n`;
    luaCode += `    }, {"", ""}, {"text", "text"})\n`;
    luaCode += `    \n`;
    luaCode += `    if not login_data or login_data[1] == "" or login_data[2] == "" then\n`;
    luaCode += `        gg.alert("❌ Логин или ключ не введены!")\n`;
    luaCode += `        return false\n`;
    luaCode += `    end\n`;
    luaCode += `    \n`;
    luaCode += `    local login = login_data[1]\n`;
    luaCode += `    local key = login_data[2]\n\n`;
    luaCode += `    if VALID_USERS[login] and VALID_USERS[login] == key then\n`;
    luaCode += `        gg.toast("✅ Доступ разрешен! Привет, " .. login)\n`;
    luaCode += `        return true\n`;
    luaCode += `    else\n`;
    luaCode += `        local message = "❌ Неверный логин или ключ!\\\\n\\\\n📋 Актуальные логины:\\\\n"\n`;
    luaCode += `        for user_login, user_key in pairs(VALID_USERS) do\n`;
    luaCode += `            message = message .. "👤 " .. user_login .. " : " .. user_key .. "\\\\n"\n`;
    luaCode += `        end\n`;
    luaCode += `        message = message .. "\\\\n🌐 Для получения доступа:\\\\n" .. GITHUB_URL\n`;
    luaCode += `        gg.alert(message)\n`;
    luaCode += `        return false\n`;
    luaCode += `    end\n`;
    luaCode += `end\n\n`;
    luaCode += `if checkLicense() then\n`;
    luaCode += `    gg.toast('✅ Скрипт запущен!')\n`;
    luaCode += `    -- ТВОЙ ОСНОВНОЙ КОД ЗДЕСЬ --\n`;
    luaCode += `else\n`;
    luaCode += `    os.exit()\n`;
    luaCode += `end`;

    const blob = new Blob([luaCode], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'auth_script.lua';
    a.click();
    
    URL.revokeObjectURL(url);
}

document.addEventListener('DOMContentLoaded', function() {
    loadUsers();
    document.getElementById('apiUrl').textContent = window.location.href;
});
