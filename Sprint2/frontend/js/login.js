document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('login-form');
    const errorDiv = document.getElementById('login-error');

    // Check for existing remember me cookie
    const rememberedUser = getCookie('rememberedUser');
    if (rememberedUser) {
        document.getElementById('username').value = rememberedUser;
        document.getElementById('rememberMe').checked = true;
    }

    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        try {
            // Clear previous error messages
            errorDiv.classList.add('d-none');
            
            // Collect form data
            const formData = new FormData(this);
            const data = Object.fromEntries(formData.entries());
            data.action = 'login';

            console.log('Attempting login...', data);

            const response = await fetch('../../backend/logic/userHandler.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            console.log('Response received:', response);
            const result = await response.json();
            console.log('Login result:', result);

            if (result.status === 'success') {
                // Handle remember me
                if (data.rememberMe) {
                    setCookie('rememberedUser', data.username, 30);
                } else {
                    deleteCookie('rememberedUser');
                }

                // Update navbar immediately
                updateNavbar(true, result.user.username);

                showSuccess('Login successful! Redirecting...');
                
                setTimeout(() => {
                    window.location.replace('./events.html');
                }, 500);
            } else {
                showError(result.message || 'Login failed');
            }
        } catch (error) {
            console.error('Login error:', error);
            showError('An error occurred. Please try again.');
        }
    });
});

function showError(message) {
    const errorDiv = document.getElementById('login-error');
    errorDiv.innerHTML = message;
    errorDiv.classList.remove('d-none', 'alert-success');
    errorDiv.classList.add('alert-danger');
}

function showSuccess(message) {
    const errorDiv = document.getElementById('login-error');
    errorDiv.innerHTML = message;
    errorDiv.classList.remove('d-none', 'alert-danger');
    errorDiv.classList.add('alert-success');
}

function setCookie(name, value, days) {
    const expires = new Date();
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
}

function getCookie(name) {
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
        const [cookieName, cookieValue] = cookie.split('=').map(c => c.trim());
        if (cookieName === name) return cookieValue;
    }
    return null;
}

function deleteCookie(name) {
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
}

function updateNavbar(isLoggedIn, username) {
    const navbar = document.getElementById('navbar');
    if (isLoggedIn) {
        navbar.innerHTML = `Welcome, ${username}! <a href="#" id="logout">Logout</a>`;
    } else {
        navbar.innerHTML = `<a href="./login.html">Login</a>`;
    }
}