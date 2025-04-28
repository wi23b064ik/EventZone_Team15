document.addEventListener('DOMContentLoaded', async function () {
    try {
        const res = await fetch('../../backend/logic/userHandler.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'checkLogin' })
        });

        const data = await res.json();

        if (data.status === 'success' && data.isLoggedIn && data.user.role === 'admin') {
            document.getElementById('admin-section').style.display = 'block';
            loadUsers(); // nur Admins sehen Userliste
        }
    } catch (err) {
        console.error('Login check failed:', err);
    }
});

function loadUsers() {
    fetch('../../backend/logic/userHandler.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'getAllUsers' })
    })
    .then(res => res.json())
    .then(data => {
        const tbody = document.querySelector('#user-table tbody');
        tbody.innerHTML = '';

        if (data.status === 'success') {
            data.users.forEach(user => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${user.id}</td>
                    <td>${user.username}</td>
                    <td>${user.email}</td>
                    <td>${user.role}</td>
                    <td>${user.firstName} ${user.surname}</td>
                    <td>
                        <button class="btn btn-sm btn-danger" onclick="deleteUser(${user.id})">Delete</button>
                    </td>
                `;
                tbody.appendChild(row);
            });
        } else {
            document.getElementById('user-message').innerHTML =
                `<div class="alert alert-danger">${data.message}</div>`;
        }
    });
}

function deleteUser(id) {
    if (!confirm('Are you sure you want to delete this user?')) return;

    fetch('../../backend/logic/userHandler.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'deleteUser', id: id })
    })
    .then(res => res.json())
    .then(data => {
        const msgBox = document.getElementById('user-message');
        if (data.status === 'success') {
            msgBox.innerHTML = `<div class="alert alert-success">${data.message}</div>`;
            loadUsers(); // reload list
        } else {
            msgBox.innerHTML = `<div class="alert alert-danger">${data.message}</div>`;
        }
    });
}


fetch('../../backend/logic/userHandler.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'getAllUsers' })
})
.then(res => res.json())
.then(data => {
    if (data.status === 'success') {
        console.log('Users:', data.users); // oder render sie in einer Tabelle
    }
});
