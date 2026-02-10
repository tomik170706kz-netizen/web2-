document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('userToken');
    const username = localStorage.getItem('userName');
    
    const path = window.location.pathname;
    const isAuthPage = path.includes('index.html') || path === '/';
    const isListPage = path.includes('anime_list.html');
    const isProfilePage = path.includes('profile.html');
    const isDetailsPage = path.includes('details.html');

    // Навигация
    const navUser = document.getElementById('nav-username');
    if (navUser && username) navUser.innerText = username;

    document.getElementById('logout-btn')?.addEventListener('click', () => {
        localStorage.clear();
        window.location.href = 'index.html';
    });

    // Редиректы
    if (!token && !isAuthPage) {
        window.location.href = 'index.html';
        return;
    }

    // --- 1. СТРАНИЦА СПИСКА (ANIME_LIST) ---
    if (isListPage) {
        loadAnimeList(); // Загружаем при входе

        document.getElementById('addAnimeForm')?.addEventListener('submit', async (e) => {
            e.preventDefault();
            const titleInput = document.getElementById('animeTitle');
            const title = titleInput.value;

            const res = await fetch('/api/anime', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json', 
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify({ title })
            });

            if (res.ok) {
                titleInput.value = ''; // Чистим поле
                loadAnimeList(); // ВОТ ЭТО ИСПРАВЛЕНО: обновляем список сразу
            }
        });
    }

    // --- 2. СТРАНИЦА ДЕТАЛЕЙ ---
    if (isDetailsPage) {
        const urlParams = new URLSearchParams(window.location.search);
        const animeId = urlParams.get('id');

        const loadDetails = async () => {
            const res = await fetch(`/api/anime/${animeId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const item = await res.json();
            if (res.ok) {
                document.getElementById('detail-title').innerText = item.title;
                document.getElementById('detail-status').value = item.status;
            }
        };
        loadDetails();

        document.getElementById('update-item-btn')?.addEventListener('click', async () => {
            const res = await fetch(`/api/anime/${animeId}`, {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify({ 
                    title: document.getElementById('detail-title').innerText, 
                    status: document.getElementById('detail-status').value 
                })
            });
            if (res.ok) {
                alert('Saved! ✅');
                window.location.href = 'anime_list.html';
            }
        });

        document.getElementById('delete-item-btn')?.addEventListener('click', async () => {
            if (!confirm('Delete?')) return;
            const res = await fetch(`/api/anime/${animeId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) window.location.href = 'anime_list.html';
        });
    }

    // --- 3. АВТОРИЗАЦИЯ ---
    if (isAuthPage) {
        if (token) window.location.href = 'anime_list.html';

        document.querySelector('.text-center a, #show-login')?.addEventListener('click', (e) => {
            e.preventDefault();
            const isLoginClick = e.target.innerText.toLowerCase().includes('login');
            document.getElementById('register-section').classList.toggle('hidden', isLoginClick);
            document.getElementById('login-section').classList.toggle('hidden', !isLoginClick);
        });

        document.getElementById('registerForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            handleAuth('/api/auth/register', {
                username: document.getElementById('reg-user').value,
                email: document.getElementById('reg-email').value,
                password: document.getElementById('reg-pass').value
            });
        });

        document.getElementById('loginForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            handleAuth('/api/auth/login', {
                email: document.getElementById('log-email').value,
                password: document.getElementById('log-pass').value
            });
        });
    }

    // --- ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ---
    async function loadAnimeList() {
        const res = await fetch('/api/anime', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        const container = document.getElementById('anime-list-container');
        if (container && Array.isArray(data)) {
            container.innerHTML = data.map(item => `
                <div class="col-md-4 mb-3">
                    <div class="card p-3 bg-dark text-white border-danger">
                        <h5>${item.title}</h5>
                        <p class="badge bg-primary">${item.status}</p>
                        <a href="details.html?id=${item._id}" class="btn btn-sm btn-outline-light">Details</a>
                    </div>
                </div>
            `).join('');
        }
    }

    async function handleAuth(url, body) {
        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        const data = await res.json();
        if (res.ok) {
            localStorage.setItem('userToken', data.token);
            localStorage.setItem('userName', data.username);
            window.location.href = 'anime_list.html';
        } else alert(data.message);
    }
});