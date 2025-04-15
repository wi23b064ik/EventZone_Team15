console.log("Redirecting to login page");

function checkLoginStatus() {
    return fetch('../../backend/logic/userHandler.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action: 'checkLogin' })
    })
    .then(response => response.json())
    .then(data => {
        updateNavbar(data.isLoggedIn, data.user?.username);
        return data.isLoggedIn;
    })
    .catch(error => {
        console.error('Auth check failed:', error);
        return false;
    });
}

function updateNavbar(isLoggedIn, username) {
    const welcomeMessage = document.getElementById('welcome-message');
    const loginLink = document.querySelector('a[href="login.html"]');
    const registerLink = document.querySelector('a[href="register.html"]');
    const logoutButton = document.getElementById('logout-btn');

    if (isLoggedIn && username) {
        welcomeMessage.textContent = `Welcome, ${username}!`;
        loginLink.parentElement.style.display = 'none';
        registerLink.parentElement.style.display = 'none';
        logoutButton.style.display = 'block';
    } else {
        welcomeMessage.textContent = 'Eventzone';
        loginLink.parentElement.style.display = 'block';
        registerLink.parentElement.style.display = 'block';
        logoutButton.style.display = 'none';
    }
}

function logout() {
    fetch('../../backend/logic/userHandler.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action: 'logout' })
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            window.location.href = 'index.html';
        }
    })
    .catch(error => console.error('Logout failed:', error));
}
