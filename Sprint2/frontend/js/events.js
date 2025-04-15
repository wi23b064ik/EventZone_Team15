function initiateEvents() {
    checkLoginStatus().then(isLoggedIn => {
        if (isLoggedIn) {
            loadEvents();
        } else {
            showLoginPrompt();
        }
    });
}

function loadEvents(category = null) {
    const loadingSpinner = document.getElementById('loading-spinner');
    loadingSpinner.style.display = 'block';

    // Build URL with category parameter if provided
    const url = new URL('../../backend/logic/eventHandler.php', window.location.href);
    url.searchParams.append('action', 'getEvents');
    if (category) {
        url.searchParams.append('category', category);
    }

    fetch(url)
        .then(response => response.json())
        .then(data => {
            loadingSpinner.style.display = 'none';
            console.log(data); // Debugging line to check the response
            if (data.status === 'success') {
                displayEvents(data.events);
                updateCategoryFilter(category);
            } else {
                if (data.message === 'Authentication required') {
                    showLoginPrompt();
                } else {
                    console.error('Error loading events:', data.message);
                }
            }
        })
        .catch(error => {
            loadingSpinner.style.display = 'none';
            console.error('Error:', error);
        });
}

// Add this new function to handle category filtering UI
function updateCategoryFilter(activeCategory) {
    const filterButtons = document.querySelectorAll('.category-filter');
    filterButtons.forEach(button => {
        const category = button.dataset.category;
        if ((category === 'all' && !activeCategory) || category === activeCategory) {
            button.classList.add('active');
        } else {
            button.classList.remove('active');
        }
    });
}

// Modify your displayEvents function to include the Add to Cart button
function displayEvents(events) {
    const eventGrid = document.querySelector('.event-grid .row');
    eventGrid.innerHTML = events.map(event => `
        <div class="col-lg-4 col-md-6 mb-4">
            <div class="card h-100">
                <img src="../res/img/${event.image}" class="card-img-top" alt="${event.name}">
                <div class="card-body">
                    <h5 class="card-title">${event.name}</h5>
                    <p class="card-text">${event.description}</p>
                    <p class="card-text">
                        <small class="text-muted">${event.date}</small>
                    </p>
                    <div class="d-flex justify-content-between align-items-center">
                        <span class="h5 mb-0">€${event.price}</span>
                        <button onclick="addToCart(${event.id})" 
                                class="btn btn-primary">
                            Book Now
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

function bookEvent(eventId, price) {
    checkLoginStatus().then(isLoggedIn => {
        if (!isLoggedIn) {
            const returnUrl = encodeURIComponent(window.location.href);
            window.location.href = `login.html?redirect=${returnUrl}`;
            return;
        }
        // Handle booking logic here
        console.log(`Booking event ${eventId} at price ${price}`);
    });
}

function showLoginPrompt() {
    const eventGrid = document.querySelector('.event-grid');
    eventGrid.innerHTML = `
        <div class="text-center">
            <h2 class="mb-4">Please Login to View Events</h2>
            <p class="mb-4">You need to be logged in to see and book events.</p>
            <a href="login.html" class="btn btn-primary btn-lg" style="background-color: #4f694d;">
                Login Now
            </a>
        </div>
    `;
}

// Add these functions to your existing events.js

function updateCartCount() {
    fetch('../../backend/logic/cartHandler.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action: 'getCartCount' })
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            document.querySelector('.badge.bg-danger').textContent = data.count;
        }
    })
    .catch(error => console.error('Error updating cart count:', error));
}

function addToCart(eventId) {
    fetch('../../backend/logic/cartHandler.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            action: 'addToCart',
            eventId: eventId,
            quantity: 1
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            updateCartCount();
            // Show success message
            //alert('Added to cart!');
        } else {
            if (data.message === 'Authentication required') {
                window.location.href = 'login.html';
            } else {
                alert(data.message || 'Failed to add to cart');
            }
        }
    })
    .catch(error => console.error('Error adding to cart:', error));
}

// Add this to your initialization code
document.addEventListener('DOMContentLoaded', function() {
    // ...existing initialization code...
    updateCartCount();  // Initial cart count update
});