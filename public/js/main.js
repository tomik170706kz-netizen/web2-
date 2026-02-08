document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('userToken');
    const username = localStorage.getItem('userName');

    // --- GLOBAL LOGIC: NAVBAR & LOGOUT ---
    const navUser = document.getElementById('nav-username');
    if (navUser && username) navUser.innerText = username;

    const logoutBtn = document.getElementById('logout-btn');
    logoutBtn?.addEventListener('click', () => {
        localStorage.clear();
        window.location.href = 'index.html';
    });

    // --- PAGE 1: AUTHENTICATION (index.html) ---
    const regForm = document.getElementById('registerForm');
    const logForm = document.getElementById('loginForm');
    
    if (regForm || logForm) {
        if (token) window.location.href = 'anime_list.html'; // Redirect if already logged in

        // Toggle logic
        document.getElementById('show-login')?.addEventListener('click', () => {
            document.getElementById('register-section').classList.add('hidden');
            document.getElementById('login-section').classList.remove('hidden');
        });

        document.getElementById('show-register')?.addEventListener('click', () => {
            document.getElementById('login-section').classList.add('hidden');
            document.getElementById('register-section').classList.remove('hidden');
        });

        // Register Action
        regForm?.addEventListener('submit', async (e) => {
            e.preventDefault();
            const userData = {
                username: document.getElementById('reg-user').value,
                email: document.getElementById('reg-email').value,
                password: document.getElementById('reg-pass').value
            };
            handleAuth('/api/auth/register', userData);
        });

        // Login Action
        logForm?.addEventListener('submit', async (e) => {
            e.preventDefault();
            const userData = {
                email: document.getElementById('log-email').value,
                password: document.getElementById('log-pass').value
            };
            handleAuth('/api/auth/login', userData);
        });
    }
// --- PAGE 2: ANIME LIST (anime_list.html) ---
const addAnimeForm = document.getElementById('addAnimeForm');

if (addAnimeForm) {
    if (!token) window.location.href = 'index.html';
    
   
    loadAnimeList(); 

    addAnimeForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const titleInput = document.getElementById('animeTitle');
        const title = titleInput.value.trim();

        if (!title) return alert("Please enter a title");

        try {
            const res = await fetch('http://localhost:5000/api/resource', { 
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify({ title: title })
            });

            if (res.ok) {
                titleInput.value = ''; 
                loadAnimeList(); 
            } else {
                const errorData = await res.json();
                alert(`Error: ${errorData.message || "Could not add anime"}`);
            }
        } catch (err) {
            console.error("Network error:", err);
            alert("Server is not responding. Check if backend is running on port 5000.");
        }
    });
}
    // --- PAGE 3: PROFILE (profile.html) ---
    const profileForm = document.getElementById('profileForm');
    if (profileForm) {
        if (!token) window.location.href = 'index.html';
        loadProfileData();

        profileForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const updatedData = {
                username: document.getElementById('prof-username').value,
                email: document.getElementById('prof-email').value
            };
            const res = await fetch('/api/users/profile', {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify(updatedData)
            });
            if (res.ok) {
                localStorage.setItem('userName', updatedData.username);
                alert('Profile Updated!');
            }
        });
    }

    // --- HELPER FUNCTIONS ---
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
        } else {
            alert(data.message || 'Auth Failed');
        }
    }
async function loadAnimeList() {
    const res = await fetch('http://localhost:5000/api/resource', {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    const container = document.getElementById('anime-list-container');
    
    if (container) {
        container.innerHTML = data.map(item => `
            <div class="col-12 col-md-6 col-lg-4">
                <div class="card h-100 p-3 shadow-sm">
                    <div class="card-body d-flex flex-column">
                        <h5 class="card-title fw-bold text-gradient">${item.title}</h5>
                        <p class="text-muted small">Status: ${item.status || 'Planned'}</p>
                        <div class="mt-auto">
                            <a href="details.html?id=${item._id}" class="btn btn-sm btn-outline-light w-100">Edit Details</a>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    }
}
});