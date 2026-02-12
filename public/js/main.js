document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('userToken');
    const username = localStorage.getItem('userName');
    
    const path = window.location.pathname;
    const isAuthPage = path.includes('index.html') || path === '/' || path.includes('login.html') || path.includes('register.html');
    const isListPage = path.includes('anime_list.html');
    const isProfilePage = path.includes('profile.html');
    const isDetailsPage = path.includes('details.html');

    // Навигация
    const navUser = document.getElementById('nav-username');
    if (navUser && username) navUser.innerText = username;

    // show admin link when current user is admin
    (async function showAdminLink() {
        if (!token) return;
        try {
            const res = await fetch('/api/users/profile', { headers: { Authorization: `Bearer ${token}` } });
            if (!res.ok) return;
            const u = await res.json();
            if (u.role === 'admin') {
                document.getElementById('admin-link')?.classList.remove('d-none');
            }
        } catch (e) { /* ignore */ }
    })();

    // Debug helper: on the landing page log anchor clicks to console so we can see if JS prevents navigation
    if (path.includes('index.html')) {
        document.addEventListener('click', (e) => {
            const a = e.target.closest('a');
            if (!a) return;
            console.log('[DEBUG] anchor clicked ->', a.getAttribute('href'), 'target element:', e.target);
            console.log('[DEBUG] defaultPrevented (capture):', e.defaultPrevented);
            // log again after event loop so any later handlers that call preventDefault are visible
            setTimeout(() => console.log('[DEBUG] defaultPrevented (after handlers):', e.defaultPrevented), 0);
        }, true);
    }

    document.getElementById('logout-btn')?.addEventListener('click', () => {
        localStorage.clear();
        window.location.href = 'index.html';
    });

    // Редиректы
        // only protect pages that are meant for logged-in users
        const protectedPaths = ['/anime_list.html', '/profile.html', '/details.html'];
        if (!token && protectedPaths.some(p => path.includes(p))) {
            window.location.href = 'login.html';
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

            document.getElementById('category-filter')?.addEventListener('change', loadAnimeList);
            document.getElementById('search-q')?.addEventListener('input', debounce(loadAnimeList, 300));
    }

    // --- 2. СТРАНИЦА ДЕТАЛЕЙ ---
    if (isDetailsPage) {
        const urlParams = new URLSearchParams(window.location.search);
        const animeId = urlParams.get('id');

        const loadDetails = async () => {
                // use public endpoint for details and reviews
                const res = await fetch(`/api/anime/public/${animeId}`);
                const item = await res.json();
                if (res.ok) {
                    document.getElementById('detail-title').innerText = item.title;
                    document.getElementById('detail-status').value = item.status;
                    document.getElementById('avg-rating').innerText = item.rating ? `Average rating: ${item.rating.toFixed(1)}` : '';
                    const reviewsList = document.getElementById('reviews-list');
                    reviewsList.innerHTML = item.reviews.length ? item.reviews.map(r => `
                        <div class="card p-2 mb-2 bg-dark text-white">
                            <strong>${r.user?.username || 'User'}</strong> <span class="text-warning">(${r.rating}/10)</span>
                            <div class="small text-muted">${new Date(r.createdAt).toLocaleString()}</div>
                            <p class="mt-2">${r.comment || ''}</p>
                        </div>
                    `).join('') : '<div class="text-muted">No reviews yet.</div>';
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

            // submit review
            document.getElementById('submit-review')?.addEventListener('click', async () => {
                if (!token) return alert('You must be logged in to write a review');
                const rating = parseInt(document.getElementById('review-rating').value, 10);
                const comment = document.getElementById('review-comment').value;
                const res = await fetch(`/api/anime/${animeId}/reviews`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify({ rating, comment })
                });
                const data = await res.json();
                if (res.ok) {
                    alert('Review added');
                    loadDetails();
                } else alert(data.message || 'Error');
            });
    }

    // --- 3. АВТОРИЗАЦИЯ ---
    if (isAuthPage) {
        if (token) window.location.href = 'anime_list.html';

        // Only wire the combined-page toggle if the combined auth sections exist
        if (document.getElementById('register-section') || document.getElementById('login-section')) {
            // support both single-page toggles if present
            document.querySelectorAll('#show-login, #show-register').forEach(el => {
                el.addEventListener('click', (e) => {
                    e.preventDefault();
                    const isLoginClick = e.target.innerText.toLowerCase().includes('login');
                    document.getElementById('register-section')?.classList.toggle('hidden', isLoginClick);
                    document.getElementById('login-section')?.classList.toggle('hidden', !isLoginClick);
                });
            });
        }

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

    // --- PROFILE PAGE ---
    if (isProfilePage) {
        if (!token) { window.location.href = 'login.html'; return; }

        const loadProfile = async () => {
            const res = await fetch('/api/users/profile', { headers: { Authorization: `Bearer ${token}` } });
            if (!res.ok) return document.getElementById('profile-msg').innerText = 'Unable to load profile';
            const u = await res.json();
            document.getElementById('prof-username').value = u.username || '';
            document.getElementById('prof-email').value = u.email || '';
        };

        loadProfile();

        document.getElementById('profileForm')?.addEventListener('submit', async (e) => {
            e.preventDefault();
            const usernameVal = document.getElementById('prof-username').value;
            const emailVal = document.getElementById('prof-email').value;

            const res = await fetch('/api/users/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ username: usernameVal, email: emailVal })
            });
            const data = await res.json();
            const msgEl = document.getElementById('profile-msg');
            if (res.ok) {
                msgEl.innerText = 'Profile updated';
                localStorage.setItem('userName', data.username);
                document.getElementById('nav-username').innerText = data.username;
            } else {
                msgEl.innerText = data.message || 'Error saving profile';
            }
        });
    }

    // --- ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ---
    async function loadAnimeList() {
            const q = document.getElementById('search-q')?.value || '';
            const category = document.getElementById('category-filter')?.value || '';
            const params = new URLSearchParams();
            if (q) params.set('q', q);
            if (category) params.set('category', category);

            const res = await fetch(`/api/anime/all?${params.toString()}`);
            const data = await res.json();
        const container = document.getElementById('anime-list-container');
        if (container && Array.isArray(data)) {
            container.innerHTML = data.map(item => `
                <div class="col-md-4 mb-3">
                    <div class="card p-3 bg-dark text-white border-danger">
                            <h5>${item.title}</h5>
                            <p class="badge bg-primary">${item.status}</p>
                            <div class="small text-muted">${(item.categories||[]).join(', ')}</div>
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

    // simple debounce
    function debounce(fn, wait) {
        let t;
        return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), wait); };
    }
});