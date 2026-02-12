document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('userToken');
  const username = localStorage.getItem('userName');
  if (!token) return window.location.href = 'login.html';

  document.getElementById('nav-username').innerText = username;
  document.getElementById('logout-btn').addEventListener('click', () => { localStorage.clear(); window.location.href = 'index.html'; });

  async function loadUsers() {
    const res = await fetch('/api/users', { headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) return document.getElementById('admin-msg').innerText = 'Unable to load users';
    const users = await res.json();
    const tbody = document.getElementById('users-tbody');
    tbody.innerHTML = users.map(u => `
      <tr>
        <td>${u.username}</td>
        <td><input data-id="${u._id}" class="form-control form-control-sm user-email-input" value="${u.email}"></td>
        <td>${u.role}</td>
        <td>
          <button class="btn btn-sm btn-primary save-email" data-id="${u._id}">Save</button>
        </td>
      </tr>
    `).join('');

    document.querySelectorAll('.save-email').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.getAttribute('data-id');
        const input = document.querySelector(`.user-email-input[data-id="${id}"]`);
        const email = input.value;
        const res = await fetch(`/api/users/${id}/email`, {
          method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ email })
        });
        const data = await res.json();
        document.getElementById('admin-msg').innerText = data.message || (res.ok ? 'Saved' : 'Error');
      });
    });
  }

  loadUsers();
});