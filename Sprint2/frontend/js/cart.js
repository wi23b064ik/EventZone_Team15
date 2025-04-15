document.addEventListener('DOMContentLoaded', function() {
    loadCartItems();
    updateCartCount();
});

function loadCartItems() {
    const cartContainer = document.getElementById('cart-items');
    
    // Log what we're sending
    const requestData = { action: 'getCartItems' };
    console.log('Sending cart request:', requestData);

    fetch('../../backend/logic/cartHandler.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify(requestData),
        credentials: 'same-origin' // Include cookies for session
    })
    .then(async response => {
        // Log response details
        console.log('Response status:', response.status);
        console.log('Response headers:', Object.fromEntries([...response.headers]));
        
        const text = await response.text();
        console.log('Raw response:', text);
        
        try {
            const data = JSON.parse(text);
            // Pretty print the parsed data
            console.log('Parsed response:', JSON.stringify(data, null, 2));
            return data;
        } catch (e) {
            console.error('Parse error:', e);
            console.error('Response that failed to parse:', text);
            throw new Error(`Failed to parse response: ${text.substring(0, 200)}`);
        }
    })
    .then(data => {
        if (data.status === 'success') {
            displayCartItems(data.items);
            updateCartSummary(data.items);
        } else {
            const errorDetails = data.debug ? 
                `<div class="small text-danger mt-2">
                    <strong>Error Details:</strong><br>
                    <pre class="text-danger bg-light p-2 mt-2" style="white-space: pre-wrap;">
                        ${JSON.stringify(data.debug, null, 2)}
                    </pre>
                </div>` : '';

            cartContainer.innerHTML = `
                <div class="alert alert-danger">
                    <h5>Error Loading Cart</h5>
                    <p>${data.message}</p>
                    ${errorDetails}
                    <div class="mt-3">
                        <button class="btn btn-sm btn-outline-primary" 
                                onclick="loadCartItems()">Try Again</button>
                    </div>
                </div>
            `;

            // Log detailed error information to console
            console.error('Cart error details:', {
                message: data.message,
                debug: data.debug,
                timestamp: new Date().toISOString(),
                fullResponse: data
            });
        }
    })
    .catch(error => {
        console.error('Cart error:', {
            error: error.toString(),
            stack: error.stack,
            timestamp: new Date().toISOString()
        });
        
        cartContainer.innerHTML = `
            <div class="alert alert-danger">
                <h5>Cart Loading Failed</h5>
                <p>${error.message}</p>
                <pre class="text-danger bg-light p-2 mt-2" style="white-space: pre-wrap;">
                    ${error.stack || error.toString()}
                </pre>
                <div class="mt-3">
                    <button class="btn btn-sm btn-outline-primary" 
                            onclick="loadCartItems()">Try Again</button>
                </div>
            </div>
        `;
    });
}

function displayCartItems(items) {
    const cartContainer = document.getElementById('cart-items');
    
    if (!items || items.length === 0) {
        cartContainer.innerHTML = `
            <div class="text-center p-4">
                <p class="mb-2">Your cart is empty</p>
                <a href="events.html" class="btn btn-primary">Browse Events</a>
            </div>
        `;
        return;
    }

    const itemsHtml = items.map(item => {
        // Convert price to number if it's a string
        const price = typeof item.price === 'string' ? parseFloat(item.price) : item.price;
        const totalPrice = price * item.quantity;
        
        return `
            <div class="cart-item d-flex align-items-center p-3 border-bottom">
                <img src="../res/img/${item.image}" alt="${item.name}" 
                     class="me-3" style="width: 100px; height: 60px; object-fit: cover;">
                <div class="flex-grow-1">
                    <h6 class="mb-0">${item.name}</h6>
                    <small class="text-muted">${item.date}</small>
                    <div class="mt-1">€${price.toFixed(2)} per ticket</div>
                </div>
                <div class="d-flex align-items-center">
                    <button class="btn btn-sm btn-outline-secondary" 
                            onclick="updateQuantity(${item.eventId}, ${item.quantity - 1})">-</button>
                    <span class="mx-2">${item.quantity}</span>
                    <button class="btn btn-sm btn-outline-secondary" 
                            onclick="updateQuantity(${item.eventId}, ${item.quantity + 1})">+</button>
                    <span class="ms-3 me-3">€${totalPrice.toFixed(2)}</span>
                    <button class="btn btn-sm btn-danger" 
                            onclick="removeFromCart(${item.eventId})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    }).join('');

    cartContainer.innerHTML = itemsHtml;
}

function updateCartSummary(items) {
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const discount = parseFloat(document.getElementById('discount').textContent.replace('€', '')) || 0;
    const total = subtotal - discount;

    document.getElementById('subtotal').textContent = `€${subtotal.toFixed(2)}`;
    document.getElementById('total').textContent = `€${total.toFixed(2)}`;
}

function updateQuantity(eventId, newQuantity) {
    if (newQuantity < 1) return;

    fetch('../../backend/logic/cartHandler.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            action: 'updateQuantity',
            eventId: eventId,
            quantity: newQuantity
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            loadCartItems();
            updateCartCount();
        } else {
            alert(data.message || 'Failed to update quantity');
        }
    })
    .catch(error => console.error('Error updating quantity:', error));
}

function removeFromCart(eventId) {
    if (!confirm('Are you sure you want to remove this item?')) return;

    fetch('../../backend/logic/cartHandler.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            action: 'removeFromCart',
            eventId: eventId
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            loadCartItems();
            updateCartCount();
        } else {
            alert(data.message || 'Failed to remove item');
        }
    })
    .catch(error => console.error('Error removing item:', error));
}

function applyVoucher() {
    const voucherCode = document.getElementById('voucher-code').value;
    if (!voucherCode) {
        alert('Please enter a voucher code');
        return;
    }

    fetch('../../backend/logic/cartHandler.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            action: 'applyVoucher',
            code: voucherCode
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            document.getElementById('discount').textContent = `-€${data.discount.toFixed(2)}`;
            loadCartItems();
        } else {
            alert(data.message || 'Invalid voucher code');
        }
    })
    .catch(error => console.error('Error applying voucher:', error));
}

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
            // Update the cart count badge in the navbar
            const cartBadge = document.querySelector('.badge.bg-danger');
            if (cartBadge) {
                cartBadge.textContent = data.count || '0';
            }
        }
    })
    .catch(error => {
        console.error('Error updating cart count:', error);
    });
}