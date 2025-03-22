// login.js - Handles authentication for the AURA game

document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const signinTab = document.getElementById('signin-tab');
    const signupTab = document.getElementById('signup-tab');
    const signinContent = document.getElementById('signin-content');
    const signupContent = document.getElementById('signup-content');
    const signinForm = document.getElementById('signin-form');
    const signupForm = document.getElementById('signup-form');
    const signinMessage = document.getElementById('signin-message');
    const signupMessage = document.getElementById('signup-message');
    
    // Temporary user data (will be replaced with database later)
    const validUser = {
        username: 'Alpha',
        password: 'Password'
    };
    
    // Tab switching functionality
    signinTab.addEventListener('click', function() {
        signinTab.classList.add('active');
        signupTab.classList.remove('active');
        signinContent.classList.add('active');
        signupContent.classList.remove('active');
        clearMessages();
        clearForms();
    });
    
    signupTab.addEventListener('click', function() {
        signinTab.classList.remove('active');
        signupTab.classList.add('active');
        signinContent.classList.remove('active');
        signupContent.classList.add('active');
        clearMessages();
        clearForms();
    });
    
    // Sign In Form Submission
    signinForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;
        
        // Add a small delay to simulate server authentication
        signinMessage.innerHTML = 'Authenticating...';
        signinMessage.className = 'message';
        
        setTimeout(() => {
            // Check if username and password match
            if (username.toLowerCase() === validUser.username.toLowerCase() && password === validUser.password) {
                signinMessage.innerHTML = 'Login successful! Redirecting...';
                signinMessage.className = 'message success';
                
                // For now, just simulate redirect with a message
                // In a real app, you would redirect to the game page
                setTimeout(() => {
                    alert('Welcome to AURA, Alpha! This is where the game would start.');
                    // window.location.href = 'game.html'; // Uncomment this when you have a game page
                }, 1500);
            } else {
                signinMessage.innerHTML = 'Invalid username or password. Please try again.';
                signinMessage.className = 'message error';
            }
        }, 1000);
    });
    
    // Sign Up Form Submission
    signupForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const newUsername = document.getElementById('new-username').value.trim();
        const newPassword = document.getElementById('new-password').value;
        const confirmPassword = document.getElementById('confirm-password').value;
        
        // Basic validation
        if (newPassword !== confirmPassword) {
            signupMessage.innerHTML = 'Passwords do not match. Please try again.';
            signupMessage.className = 'message error';
            return;
        }
        
        // Add a small delay to simulate server operation
        signupMessage.innerHTML = 'Creating account...';
        signupMessage.className = 'message';
        
        setTimeout(() => {
            // Show success message (in a real app, you would save to database)
            signupMessage.innerHTML = 'Account created! Please go to sign in.';
            signupMessage.className = 'message success';
            
            // Clear the form
            document.getElementById('signup-form').reset();
            
            // For demonstration, show a tooltip to use the predefined credentials
            setTimeout(() => {
                signupMessage.innerHTML = 'For testing, use username: Alpha and password: Password';
                signupMessage.className = 'message';
            }, 3000);
        }, 1500);
    });
    
    // Helper functions
    function clearMessages() {
        signinMessage.innerHTML = '';
        signinMessage.className = 'message';
        signupMessage.innerHTML = '';
        signupMessage.className = 'message';
    }
    
    function clearForms() {
        signinForm.reset();
        signupForm.reset();
    }
    
    // Add typewriter effect to the game title (optional visual enhancement)
    const gameTitle = document.querySelector('.game-title');
    const titleText = gameTitle.textContent;
    gameTitle.textContent = '';
    
    let i = 0;
    const typeWriter = function() {
        if (i < titleText.length) {
            gameTitle.textContent += titleText.charAt(i);
            i++;
            setTimeout(typeWriter, 150);
        }
    };
    
    // Start the typewriter effect
    typeWriter();
});