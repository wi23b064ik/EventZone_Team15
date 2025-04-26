function updateNavigation(isLoggedIn) {
    const navItems = {
        home: { path: 'index.html', text: 'Home', requiresAuth: false, alwaysShow: true },
        events: { path: 'events.html', text: 'Events', requiresAuth: false, alwaysShow: true },
        profile: { path: 'profile.html', text: 'Profile', requiresAuth: true },
        cart: { path: 'cart.html', text: 'Cart', requiresAuth: false, alwaysShow: true },
        login: { path: 'login.html', text: 'Login', requiresAuth: false, hideWhenAuth: true },
        register: { path: 'register.html', text: 'Register', requiresAuth: false, hideWhenAuth: true }
    };

    const navList = document.querySelector('.navbar-nav');
    navList.innerHTML = ''; // Clear existing nav items

    Object.entries(navItems).forEach(([key, item]) => {
        // Skip items based on auth state
        if (isLoggedIn && item.hideWhenAuth) return;
        if (!isLoggedIn && item.requiresAuth) return;

        const li = document.createElement('li');
        li.className = 'nav-item';

        // Get current page for active state
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        const isActive = currentPage === item.path;

        li.innerHTML = `
            <a class="nav-link text-dark ${isActive ? 'active' : ''}" href="${item.path}">
                ${item.text}
            </a>
        `;

        navList.appendChild(li);
    });

    // Add logout button if logged in
    if (isLoggedIn) {
        const li = document.createElement('li');
        li.className = 'nav-item';
        li.innerHTML = `
            <button id="logout-btn" class="nav-link text-dark btn btn-link" onclick="logout()">
                Logout
            </button>
        `;
        navList.appendChild(li);
    }
}

// Update auth.js to use this navigation control
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
        updateNavigation(data.isLoggedIn);
        return data.isLoggedIn;
    })
    .catch(error => {
        console.error('Auth check failed:', error);
        return false;
    });
}

// Redirect unauthorized users
function checkAuthorization() {
    const publicPages = ['index.html', 'events.html', 'login.html', 'register.html'];
    const currentPage = window.location.pathname.split('/').pop();
    
    if (!publicPages.includes(currentPage)) {
        checkLoginStatus().then(isLoggedIn => {
            if (!isLoggedIn) {
                window.location.href = 'login.html';
            }
        });
    }
}