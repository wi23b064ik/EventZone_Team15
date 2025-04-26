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
  
    eventGrid.innerHTML = events.map(event => {
      const images = event.images.split(','); // <-- Bilder aufteilen
      const carouselId = `carouselEvent${event.id}`;
  
      const indicators = images.map((_, i) => `
        <button type="button" data-bs-target="#${carouselId}" data-bs-slide-to="${i}" 
                ${i === 0 ? 'class="active" aria-current="true"' : ''} 
                aria-label="Slide ${i + 1}"></button>
      `).join('');
  
      const slides = images.map((img, i) => `
        <div class="carousel-item ${i === 0 ? 'active' : ''}">
          <img src="../res/${img.trim()}" class="d-block w-100" style="height: 250px; object-fit: cover;" alt="${event.name}">
        </div>
      `).join('');

      const deleteButton = (window.currentUser?.role === 'admin')
            ? `<button onclick="deleteEvent(${event.id})" class="btn btn-sm btn-outline-danger">Delete</button>`
            : '';

            const editButton = (window.currentUser?.role === 'admin')
            ? `<button onclick="editEvent(${event.id})" class="btn btn-sm btn-outline-warning me-2">Edit</button>`
            : '';
          
  
      return `
        <div class="col-lg-4 col-md-6 mb-4">
          <div class="card h-100">
            <div id="${carouselId}" class="carousel slide" data-bs-ride="carousel">
              <div class="carousel-indicators">${indicators}</div>
              <div class="carousel-inner">${slides}</div>
              <button class="carousel-control-prev" type="button" data-bs-target="#${carouselId}" data-bs-slide="prev">
                <span class="carousel-control-prev-icon"></span>
              </button>
              <button class="carousel-control-next" type="button" data-bs-target="#${carouselId}" data-bs-slide="next">
                <span class="carousel-control-next-icon"></span>
              </button>
            </div>
            <div class="card-body">
              <h5 class="card-title">${event.name}</h5>
              <p class="card-text">${event.description}</p>
              <p class="card-text"><small class="text-muted">${event.date}</small></p>
              <div class="d-flex justify-content-between align-items-center">
                <span class="h5 mb-0">€${event.price}</span>
                <button onclick="addToCart(${event.id})" class="btn btn-primary">Book Now</button>
                   <button onclick="deleteEvent(${event.id})" class="btn btn-sm btn-outline-danger">
                  Delete
                </button>
                <button onclick="editEvent(${event.id})" class="btn btn-sm btn-outline-warning me-2">Edit</button>
              </div>
            </div>
          </div>
        </div>
      `;
    }).join('');
}

function deleteEvent(eventId) {
    if (!confirm('Are you sure you want to delete this event?')) return;

    fetch(`../../backend/logic/eventHandler.php?action=deleteEvent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: eventId })
    })
    .then(res => res.json())
    .then(data => {
        if (data.status === 'success') {
            loadEvents();
        } else {
            alert('Delete failed: ' + data.message);
        }
    })
    .catch(err => {
        console.error('Error calling deleteEvent:', err);
        alert('An error occurred');
    });
}

function editEvent(eventId) {
    fetch(`../../backend/logic/eventHandler.php?action=getEvents`)
      .then(res => res.json())
      .then(data => {
        const event = data.events.find(e => e.id == eventId);
        if (!event) return alert("Event not found");
  
        const form = document.getElementById('edit-event-form');
        form.name.value = event.name;
        form.description.value = event.description;
        form.date.value = event.date.split(',')[1].trim(); // falls nötig formatieren
        form.price.value = event.price;
        form.images.value = event.images;
        form.capacity.value = event.capacity;
        form.category.value = event.category;
        form.id.value = event.id;
  
        new bootstrap.Modal(document.getElementById('editEventModal')).show();
      });
  }

  document.getElementById('edit-event-form').addEventListener('submit', function (e) {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    const eventData = {};
  
    formData.forEach((value, key) => eventData[key] = value);
    eventData.price = Number(eventData.price);
    eventData.capacity = Number(eventData.capacity);
  
    fetch('../../backend/logic/eventHandler.php?action=updateEvent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(eventData)
    })
      .then(res => res.json())
      .then(data => {
        const msgBox = document.getElementById('edit-event-message');
        if (data.status === 'success') {
          msgBox.innerHTML = `<div class="alert alert-success">${data.message}</div>`;
          setTimeout(() => {
            bootstrap.Modal.getInstance(document.getElementById('editEventModal')).hide();
            loadEvents();
          }, 1000);
        } else {
          msgBox.innerHTML = `<div class="alert alert-danger">${data.message}</div>`;
        }
      });
  });
    
  

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

document.addEventListener('DOMContentLoaded', function () {
    updateCartCount();  

    const createForm = document.getElementById('create-event-form');
    if (createForm) {
        createForm.addEventListener('submit', function (e) {
            e.preventDefault();

            const form = e.target;
            const formData = new FormData(form);

            const eventData = {};
            formData.forEach((value, key) => {
                if (key === 'images[]') {
                    if (!eventData['images']) eventData['images'] = [];
                    eventData.images.push(`img/${value.name}`);
                } else if (key === 'price' || key === 'capacity') {
                    eventData[key] = Number(value);  // Wichtig: Zahlen erzwingen!
                } else {
                    eventData[key] = value;
                }
            });

            eventData['images'] = eventData['images'].join(',');

            console.log('Event Data:', eventData);

            fetch('../../backend/logic/eventHandler.php?action=createEvent', {
                method: 'POST',
                body: JSON.stringify(eventData)
            })
            .then(res => res.json())
            .then(data => {
                const msgBox = document.getElementById('create-event-message');
                if (data.status === 'success') {
                    msgBox.innerHTML = `<div class="alert alert-success">${data.message}</div>`;
                    form.reset();
                    loadEvents(); 
                } else {
                    msgBox.innerHTML = `<div class="alert alert-danger">${data.message}</div>`;
                    console.error(data);
                }
            })
            .catch(err => {
                console.error('Request failed:', err);
                document.getElementById('create-event-message').innerHTML =
                    `<div class="alert alert-danger">Request failed</div>`;
            });
        });
    }
});

