// login.js - Handles authentication for the Dreamscape portal

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
    const selectedAvatarInput = document.getElementById('selected-avatar');
    const avatarImages = document.querySelectorAll('.avatar-img');
    
    // Temporary user data (will be replaced with database later)
    const validUser = {
        username: 'dreamer',
        password: 'dream123'
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
    
    // Avatar selection functionality
    if (avatarImages) {
        avatarImages.forEach(img => {
            img.addEventListener('click', function() {
                // Remove selected class from all avatars
                avatarImages.forEach(avatar => avatar.classList.remove('selected'));
                
                // Add selected class to clicked avatar
                this.classList.add('selected');
                
                // Update hidden input value
                selectedAvatarInput.value = this.getAttribute('data-avatar');
            });
        });
    }
    
    // Sign In Form Submission
    signinForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;
        
        // Add a small delay to simulate server authentication
        signinMessage.innerHTML = 'Connecting to the dreamscape...';
        signinMessage.className = 'message';
        
        setTimeout(() => {
            // For demo purposes, any username/password combination will work
            // In a real app, you would validate against a database
            signinMessage.innerHTML = 'Login successful! Entering the dreamscape...';
            signinMessage.className = 'message success';
            
            // Redirect to the home page
            setTimeout(() => {
                window.location.href = 'homePage.html';
            }, 1500);
        }, 1000);
    });
    
    // Sign Up Form Submission
    signupForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const newUsername = document.getElementById('new-username').value.trim();
        const newPassword = document.getElementById('new-password').value;
        const confirmPassword = document.getElementById('confirm-password').value;
        const selectedAvatar = selectedAvatarInput.value;
        
        // Basic validation
        if (newPassword !== confirmPassword) {
            signupMessage.innerHTML = 'Passwords do not match. Please try again.';
            signupMessage.className = 'message error';
            return;
        }
        
        if (!selectedAvatar) {
            signupMessage.innerHTML = 'Please select an avatar to continue.';
            signupMessage.className = 'message error';
            return;
        }
        
        // Add a small delay to simulate server operation
        signupMessage.innerHTML = 'Creating your dreamscape profile...';
        signupMessage.className = 'message';
        
        setTimeout(() => {
            // Show success message (in a real app, you would save to database)
            signupMessage.innerHTML = 'Welcome, Dreamer! Your profile has been created. Please sign in to continue.';
            signupMessage.className = 'message success';
            
            // Clear the form
            document.getElementById('signup-form').reset();
            
            // Switch back to sign in tab after a delay
            setTimeout(() => {
                signinTab.click();
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
        
        // Clear avatar selection
        if (avatarImages) {
            avatarImages.forEach(avatar => avatar.classList.remove('selected'));
        }
        if (selectedAvatarInput) {
            selectedAvatarInput.value = '';
        }
    }
    
    // Add typewriter effect to the site title
    const siteTitle = document.querySelector('.site-title');
    if (siteTitle) {
        const titleText = siteTitle.textContent;
        siteTitle.textContent = '';
        
        let i = 0;
        const typeWriter = function() {
            if (i < titleText.length) {
                siteTitle.textContent += titleText.charAt(i);
                i++;
                setTimeout(typeWriter, 150);
            }
        };
        
        // Start the typewriter effect
        typeWriter();
    }
});