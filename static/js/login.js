// login.js

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBBsGAQfn8KGRxvrZUbHXdGsVCEt5uZKGk",
    authDomain: "recruitment-portal-automation.firebaseapp.com",
    projectId: "recruitment-portal-automation",
    storageBucket: "recruitment-portal-automation.appspot.com",
    messagingSenderId: "363542928138",
    appId: "1:363542928138:web:33373518ceef2ff37df8f3"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

// DOM Elements
const elements = {
    // Portal toggle elements
    candidatePortalOption: document.getElementById('candidatePortalOption'),
    recruiterPortalOption: document.getElementById('recruiterPortalOption'),
    
    // Form toggle elements
    candidateSignUpToggle: document.getElementById('candidateSignUpToggle'),
    candidateSignInToggle: document.getElementById('candidateSignInToggle'),
    recruiterSignUpToggle: document.getElementById('recruiterSignUpToggle'),
    recruiterSignInToggle: document.getElementById('recruiterSignInToggle'),
    
    // Form containers
    candidateLoginForm: document.getElementById('candidateLoginForm'),
    recruiterLoginForm: document.getElementById('recruiterLoginForm'),
    candidateSignInForm: document.getElementById('candidateSignInForm'),
    candidateSignUpForm: document.getElementById('candidateSignUpForm'),
    recruiterSignInForm: document.getElementById('recruiterSignInForm'),
    recruiterSignUpForm: document.getElementById('recruiterSignUpForm'),
    
    // Forms
    candidateSignInFormElement: document.getElementById('candidateSignInForm'),
    candidateSignUpFormElement: document.getElementById('candidateSignUpFormElement'),
    recruiterSignInFormElement: document.getElementById('recruiterSignInForm'),
    recruiterSignUpFormElement: document.getElementById('recruiterSignUpFormElement'),
    
    // Social login buttons
    candidateGoogleSignIn: document.getElementById('candidateGoogleSignIn'),
    recruiterGoogleSignIn: document.getElementById('recruiterGoogleSignIn'),
    candidateLinkedInSignIn: document.getElementById('candidateLinkedInSignIn'),
    
    // UI elements
    loading: document.getElementById('loading'),
    errorAlert: document.getElementById('errorAlert'),
    successAlert: document.getElementById('successAlert'),
    
    // Info panel elements
    portalTitle: document.getElementById('portalTitle'),
    portalDescription: document.getElementById('portalDescription'),
    portalImage: document.getElementById('portalImage')
};

// Helper Functions
function showLoading() {
    elements.loading.style.display = 'block';
}

function hideLoading() {
    elements.loading.style.display = 'none';
}

function showError(message) {
    elements.errorAlert.textContent = message;
    elements.errorAlert.style.display = 'block';
    setTimeout(() => {
        elements.errorAlert.style.display = 'none';
    }, 5000);
}

function showSuccess(message) {
    elements.successAlert.textContent = message;
    elements.successAlert.style.display = 'block';
    setTimeout(() => {
        elements.successAlert.style.display = 'none';
    }, 5000);
}

function switchToCandidatePortal() {
    elements.candidatePortalOption.classList.add('active');
    elements.recruiterPortalOption.classList.remove('active');
    elements.candidateLoginForm.classList.add('active-form');
    elements.recruiterLoginForm.classList.remove('active-form');
    
    elements.portalTitle.textContent = 'Find Your Perfect Job';
    elements.portalDescription.textContent = 'Use our AI-powered platform to find opportunities that match your skills and experience.';
    elements.portalImage.src = 'static/images/candidate-illustration.svg';
    elements.portalImage.alt = 'Job Search';
}

function switchToRecruiterPortal() {
    elements.recruiterPortalOption.classList.add('active');
    elements.candidatePortalOption.classList.remove('active');
    elements.recruiterLoginForm.classList.add('active-form');
    elements.candidateLoginForm.classList.remove('active-form');
    
    elements.portalTitle.textContent = 'Find Top Talent';
    elements.portalDescription.textContent = 'Use our AI-powered platform to find the best candidates for your open positions.';
    elements.portalImage.src = 'static/images/recruiter-illustration.svg';
    elements.portalImage.alt = 'Recruiting Talent';
}

// Check for previously logged out state
document.addEventListener('DOMContentLoaded', function() {
    console.log('Login page loaded');
    
    // Check if we just logged out
    if (sessionStorage.getItem('loggedOut') === 'true') {
        console.log('Recently logged out - preventing auto-login');
        
        // Clear all stored credentials
        clearAuthData();
        
        // Force Firebase to forget the user
        if (typeof firebase !== 'undefined' && firebase.auth) {
            firebase.auth().signOut().catch(e => console.log('Final signout error:', e));
        }
        
        sessionStorage.removeItem('loggedOut');
    }
    
    // Check if user is already signed in
    auth.onAuthStateChanged(function(user) {
        if (user) {
            console.log('User already signed in:', user.email);
            // User is signed in, check role and redirect
            checkUserTypeAndRedirect(user.uid);
        }
    });
});

// Clear all authentication data
function clearAuthData() {
    console.log('Clearing all auth data');
    
    // Clear all local storage related to Firebase
    for (let key in localStorage) {
        if (key.includes('firebase') || key.includes('firebaseui')) {
            localStorage.removeItem(key);
        }
    }
    
    // Clear all session storage
    sessionStorage.clear();
    
    // Attempt to remove simple cookies
    document.cookie.split(";").forEach(function(c) {
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });
}

// Set up Firebase persistence to prevent auto login issues
firebase.auth().setPersistence(firebase.auth.Auth.Persistence.SESSION)
.then(() => {
    console.log('Firebase persistence set to SESSION');
})
.catch((error) => {
    console.error('Error setting persistence:', error);
});

// Event Listeners
// Portal toggle
elements.candidatePortalOption.addEventListener('click', switchToCandidatePortal);
elements.recruiterPortalOption.addEventListener('click', switchToRecruiterPortal);

// Form toggle
elements.candidateSignUpToggle.addEventListener('click', function() {
    elements.candidateSignInForm.style.display = 'none';
    elements.candidateSignUpForm.style.display = 'block';
});

elements.candidateSignInToggle.addEventListener('click', function() {
    elements.candidateSignUpForm.style.display = 'none';
    elements.candidateSignInForm.style.display = 'block';
});

elements.recruiterSignUpToggle.addEventListener('click', function() {
    elements.recruiterSignInForm.style.display = 'none';
    elements.recruiterSignUpForm.style.display = 'block';
});

elements.recruiterSignInToggle.addEventListener('click', function() {
    elements.recruiterSignUpForm.style.display = 'none';
    elements.recruiterSignInForm.style.display = 'block';
});

// Candidate Sign In Form
elements.candidateSignInFormElement.addEventListener('submit', function(e) {
    e.preventDefault();
    showLoading();
    
    const email = document.getElementById('candidateEmail').value;
    const password = document.getElementById('candidatePassword').value;
    
    auth.signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            // Check if user type matches in database
            checkUserTypeAndRedirect(userCredential.user.uid);
        })
        .catch((error) => {
            hideLoading();
            showError('Login Error: ' + error.message);
        });
});

// Recruiter Sign In Form
elements.recruiterSignInFormElement.addEventListener('submit', function(e) {
    e.preventDefault();
    showLoading();
    
    const email = document.getElementById('recruiterEmail').value;
    const password = document.getElementById('recruiterPassword').value;
    
    auth.signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            // Check if user type matches in database
            checkUserTypeAndRedirect(userCredential.user.uid);
        })
        .catch((error) => {
            hideLoading();
            showError('Login Error: ' + error.message);
        });
});

// Candidate Sign Up Form
elements.candidateSignUpFormElement.addEventListener('submit', function(e) {
    e.preventDefault();
    showLoading();
    
    const fullName = document.getElementById('candidateFullName').value;
    const email = document.getElementById('candidateSignUpEmail').value;
    const password = document.getElementById('candidateSignUpPassword').value;
    const confirmPassword = document.getElementById('candidateConfirmPassword').value;
    
    if (password !== confirmPassword) {
        hideLoading();
        showError('Passwords do not match!');
        return;
    }
    
    // Create user in Firebase Auth
    auth.createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            // Register user in your backend
            return fetch('/api/register_user', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    uid: userCredential.user.uid,
                    email: email,
                    displayName: fullName,
                    role: 'candidate'
                })
            });
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                showSuccess('Registration successful!');
                setTimeout(() => {
                    window.location.href = data.redirect;
                }, 1000);
            } else {
                throw new Error(data.message || 'Registration failed');
            }
        })
        .catch((error) => {
            hideLoading();
            showError('Registration Error: ' + error.message);
        });
});

// Recruiter Sign Up Form
elements.recruiterSignUpFormElement.addEventListener('submit', function(e) {
    e.preventDefault();
    showLoading();
    
    const fullName = document.getElementById('recruiterFullName').value;
    const companyName = document.getElementById('companyName').value;
    const email = document.getElementById('recruiterSignUpEmail').value;
    const password = document.getElementById('recruiterSignUpPassword').value;
    const confirmPassword = document.getElementById('recruiterConfirmPassword').value;
    
    if (password !== confirmPassword) {
        hideLoading();
        showError('Passwords do not match!');
        return;
    }
    
    // Create user in Firebase Auth
    auth.createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            // Register user in your backend
            return fetch('/api/register_user', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    uid: userCredential.user.uid,
                    email: email,
                    displayName: fullName,
                    company: companyName,
                    role: 'recruiter'
                })
            });
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                showSuccess('Registration successful!');
                setTimeout(() => {
                    window.location.href = data.redirect;
                }, 1000);
            } else {
                throw new Error(data.message || 'Registration failed');
            }
        })
        .catch((error) => {
            hideLoading();
            showError('Registration Error: ' + error.message);
        });
});

// Social login handlers
elements.candidateGoogleSignIn.addEventListener('click', function() {
    showLoading();
    signInWithGoogle('candidate');
});

elements.recruiterGoogleSignIn.addEventListener('click', function() {
    showLoading();
    signInWithGoogle('recruiter');
});

elements.candidateLinkedInSignIn.addEventListener('click', function() {
    // LinkedIn authentication would need to be set up in Firebase
    alert('LinkedIn authentication would be implemented here');
});

// Authentication functions
function signInWithGoogle(userType) {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider)
        .then((result) => {
            // Check if user exists in database
            fetch('/api/check_user_role', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ uid: result.user.uid })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // User exists, check if role matches
                    if (data.role === userType) {
                        window.location.href = data.redirect;
                    } else {
                        hideLoading();
                        showError(`You're registered as a ${data.role}, not as a ${userType}`);
                    }
                } else {
                    // User doesn't exist in database, register them
                    return fetch('/api/register_user', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            uid: result.user.uid,
                            email: result.user.email,
                            displayName: result.user.displayName,
                            role: userType
                        })
                    })
                    .then(response => response.json())
                    .then(data => {
                        if (data.success) {
                            window.location.href = data.redirect;
                        } else {
                            throw new Error(data.message);
                        }
                    });
                }
            })
            .catch(error => {
                hideLoading();
                showError('Error checking user: ' + error.message);
            });
        })
        .catch((error) => {
            hideLoading();
            showError('Google Sign In Error: ' + error.message);
        });
}

function checkUserTypeAndRedirect(userId) {
    fetch('/api/check_user_role', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ uid: userId })
    })
    .then(response => response.json())
    .then(data => {
        hideLoading();
        if (data.success) {
            window.location.href = data.redirect;
        } else {
            showError('User not found or role mismatch. Please register first.');
        }
    })
    .catch(error => {
        hideLoading();
        showError('Error: ' + error.message);
        console.error('Error:', error);
    });
}