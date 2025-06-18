document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const errorMessage = document.getElementById('errorMessage');
    const errorText = document.getElementById('errorText');
    const togglePassword = document.getElementById('togglePassword');
    const passwordInput = document.getElementById('password');

    // Toggle password visibility
    if (togglePassword && passwordInput) {
        togglePassword.addEventListener('click', function() {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            
            // Toggle eye icon
            const eyeIcon = togglePassword.querySelector('i');
            eyeIcon.classList.toggle('fa-eye');
            eyeIcon.classList.toggle('fa-eye-slash');
        });
    }

    // Handle form submission
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const username = document.getElementById('username').value.trim();
            const password = document.getElementById('password').value.trim();

            // Basic validation
            if (!username || !password) {
                showError('Please fill in all fields');
                return;
            }

            // Simulate authentication (replace with actual authentication in production)
            if (username === 'rajat' && password === 'rajat123') {
                // Store authentication state
                localStorage.setItem('isAuthenticated', 'true');
                localStorage.setItem('user', JSON.stringify({
                    username: username,
                    role: 'admin',
                    lastLogin: new Date().toISOString()
                }));

                // Show success message
                window.libraryUtils.showNotification('Login successful! Redirecting...', 'success');

                // Redirect to dashboard
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1500);
            } else {
                showError('Invalid username or password');
            }
        });
    }

    // Function to show error message
    function showError(message) {
        if (errorMessage && errorText) {
            errorText.textContent = message;
            errorMessage.classList.remove('hidden');

            // Hide error after 3 seconds
            setTimeout(() => {
                errorMessage.classList.add('hidden');
            }, 3000);
        }
    }

    // Check authentication status
    function checkAuth() {
        const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
        const currentPage = window.location.pathname.split('/').pop();

        // If on login page and already authenticated, redirect to dashboard
        if (currentPage === 'login.html' && isAuthenticated) {
            window.location.href = 'index.html';
        }

        // If on protected page and not authenticated, redirect to login
        const protectedPages = ['books.html', 'borrowers.html', 'due_dates.html'];
        if (protectedPages.includes(currentPage) && !isAuthenticated) {
            window.location.href = 'login.html';
        }
    }

    // Check authentication status on page load
    checkAuth();
});

// Logout function
function logout() {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('user');
    window.location.href = 'login.html';
}
