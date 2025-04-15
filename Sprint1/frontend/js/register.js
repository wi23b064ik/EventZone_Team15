document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('register-form');
    const errorDiv = document.getElementById('register-error');

    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Clear previous error messages
        errorDiv.classList.add('d-none');
        errorDiv.textContent = '';

        // Client-side validation
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirm-password').value;
        
        if (password !== confirmPassword) {
            showError('Passwords do not match');
            return;
        }

        // Collect form data
        const formData = new FormData(this);
        const data = Object.fromEntries(formData.entries());
        
        // Remove confirm-password from data as it's not needed in backend
        delete data['confirm-password'];
        
        // Add action type
        data.action = 'register';

        try {
            console.log('Sending data:', data); // Debug log
            const response = await fetch('../../backend/logic/userHandler.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            console.log('Response status:', response.status); // Debug log
            const result = await response.json();
            console.log('Response data:', result); // Debug log

            if (result.status === 'success') {
                showSuccess(result.message);
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 2000);
            } else {
                if (result.errors && Array.isArray(result.errors)) {
                    showError(result.errors.join('<br>'));
                } else {
                    showError(result.message || 'Registration failed');
                }
            }
        } catch (error) {
            console.error('Error:', error); // Debug log
            showError('An error occurred. Please check the console for details.');
        }
    });

    // Add password strength indicator
    const passwordInput = document.getElementById('password');
    passwordInput.addEventListener('input', function() {
        validatePasswordStrength(this.value);
    });
});

function showError(message) {
    const errorDiv = document.getElementById('register-error');
    errorDiv.innerHTML = message;
    errorDiv.classList.remove('d-none', 'alert-success');
    errorDiv.classList.add('alert-danger');
}

function showSuccess(message) {
    const errorDiv = document.getElementById('register-error');
    errorDiv.innerHTML = message;
    errorDiv.classList.remove('d-none', 'alert-danger');
    errorDiv.classList.add('alert-success');
}

function validatePasswordStrength(password) {
    let strength = 0;
    const feedback = [];

    // Length check
    if (password.length >= 8) strength += 1;
    
    // Contains number
    if (/\d/.test(password)) strength += 1;
    
    // Contains lowercase
    if (/[a-z]/.test(password)) strength += 1;
    
    // Contains uppercase
    if (/[A-Z]/.test(password)) strength += 1;
    
    // Contains special character
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;

    // Update password feedback (you'll need to add these elements to your HTML)
    const strengthIndicator = document.getElementById('password-strength');
    if (strengthIndicator) {
        let strengthText = '';
        let strengthClass = '';

        switch (strength) {
            case 0:
            case 1:
                strengthText = 'Weak';
                strengthClass = 'text-danger';
                break;
            case 2:
            case 3:
                strengthText = 'Medium';
                strengthClass = 'text-warning';
                break;
            case 4:
            case 5:
                strengthText = 'Strong';
                strengthClass = 'text-success';
                break;
        }

        strengthIndicator.textContent = strengthText;
        strengthIndicator.className = strengthClass;
    }
}