// This code should be added to your login.html page before the closing </body> tag

// Firebase configuration
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
  };
  
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);
  const auth = firebase.auth();
  
  // DOM elements
  const candidateSignInForm = document.getElementById('candidateSignInForm');
  const candidateSignUpForm = document.getElementById('candidateSignUpForm');
  const recruiterSignInForm = document.getElementById('recruiterSignInForm');
  const recruiterSignUpForm = document.getElementById('recruiterSignUpForm');
  const candidateGoogleSignIn = document.getElementById('candidateGoogleSignIn');
  const recruiterGoogleSignIn = document.getElementById('recruiterGoogleSignIn');
  const candidateLinkedInSignIn = document.getElementById('candidateLinkedInSignIn');
  
  // Toggle between sign in and sign up forms
  document.getElementById('candidateSignUpToggle').addEventListener('click', function() {
    document.getElementById('candidateSignInForm').style.display = 'none';
    document.getElementById('candidateSignUpForm').style.display = 'block';
  });
  
  document.getElementById('candidateSignInToggle').addEventListener('click', function() {
    document.getElementById('candidateSignUpForm').style.display = 'none';
    document.getElementById('candidateSignInForm').style.display = 'block';
  });
  
  document.getElementById('recruiterSignUpToggle').addEventListener('click', function() {
    document.getElementById('recruiterSignInForm').style.display = 'none';
    document.getElementById('recruiterSignUpForm').style.display = 'block';
  });
  
  document.getElementById('recruiterSignInToggle').addEventListener('click', function() {
    document.getElementById('recruiterSignUpForm').style.display = 'none';
    document.getElementById('recruiterSignInForm').style.display = 'block';
  });
  
  // Sign in with email and password - Candidate
  candidateSignInForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const email = document.getElementById('candidateEmail').value;
    const password = document.getElementById('candidatePassword').value;
    
    signInWithEmail(email, password, 'candidate');
  });
  
  // Sign up with email and password - Candidate
  candidateSignUpForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const name = document.getElementById('candidateFullName').value;
    const email = document.getElementById('candidateSignUpEmail').value;
    const password = document.getElementById('candidateSignUpPassword').value;
    const confirmPassword = document.getElementById('candidateConfirmPassword').value;
    
    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    
    signUpWithEmail(name, email, password, 'candidate');
  });
  
  // Sign in with email and password - Recruiter
  recruiterSignInForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const email = document.getElementById('recruiterEmail').value;
    const password = document.getElementById('recruiterPassword').value;
    
    signInWithEmail(email, password, 'recruiter');
  });
  
  // Sign up with email and password - Recruiter
  recruiterSignUpForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const name = document.getElementById('recruiterFullName').value;
    const company = document.getElementById('companyName').value;
    const email = document.getElementById('recruiterSignUpEmail').value;
    const password = document.getElementById('recruiterSignUpPassword').value;
    const confirmPassword = document.getElementById('recruiterConfirmPassword').value;
    
    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    
    signUpWithEmail(name, email, password, 'recruiter', company);
  });
  
  // Google Sign In - Candidate
  candidateGoogleSignIn.addEventListener('click', function() {
    signInWithGoogle('candidate');
  });
  
  // Google Sign In - Recruiter
  recruiterGoogleSignIn.addEventListener('click', function() {
    signInWithGoogle('recruiter');
  });
  
  // LinkedIn Sign In - Candidate
  candidateLinkedInSignIn.addEventListener('click', function() {
    // LinkedIn authentication would be implemented here
    alert('LinkedIn authentication would be implemented here');
  });
  
  // Sign in with email and password
  function signInWithEmail(email, password, role) {
    auth.signInWithEmailAndPassword(email, password)
      .then((userCredential) => {
        // Check user role and redirect
        checkUserRoleAndRedirect(userCredential.user.uid, role);
      })
      .catch((error) => {
        // Handle errors
        const errorMessage = error.message;
        alert('Error: ' + errorMessage);
      });
  }
  
  // Sign up with email and password
  function signUpWithEmail(name, email, password, role, company = '') {
    auth.createUserWithEmailAndPassword(email, password)
      .then((userCredential) => {
        // Update user profile
        return userCredential.user.updateProfile({
          displayName: name
        }).then(() => {
          // Register user in database
          registerUserInDatabase(userCredential.user.uid, name, email, role, company);
        });
      })
      .catch((error) => {
        // Handle errors
        const errorMessage = error.message;
        alert('Error: ' + errorMessage);
      });
  }
  
  // Sign in with Google
  function signInWithGoogle(role) {
    const provider = new firebase.auth.GoogleAuthProvider();
    
    auth.signInWithPopup(provider)
      .then((result) => {
        // Check if user exists in database
        checkUserExistsInDatabase(result.user.uid).then(exists => {
          if (exists) {
            // Check user role and redirect
            checkUserRoleAndRedirect(result.user.uid, role);
          } else {
            // Register new user
            registerUserInDatabase(
              result.user.uid,
              result.user.displayName || 'User',
              result.user.email,
              role
            );
          }
        });
      })
      .catch((error) => {
        // Handle errors
        const errorMessage = error.message;
        alert('Error: ' + errorMessage);
      });
  }
  
  // Check if user exists in database
  function checkUserExistsInDatabase(uid) {
    return fetch('/api/check_user_exists', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ uid: uid }),
    })
    .then(response => response.json())
    .then(data => {
      return data.exists;
    })
    .catch(error => {
      console.error('Error checking if user exists:', error);
      return false;
    });
  }
  
  // Register user in database
  function registerUserInDatabase(uid, name, email, role, company = '') {
    const userData = {
      uid: uid,
      displayName: name,
      email: email,
      role: role
    };
    
    if (company) {
      userData.company = company;
    }
    
    fetch('/api/register_user', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        window.location.href = data.redirect;
      } else {
        alert('Error: ' + data.message);
      }
    })
    .catch((error) => {
      console.error('Error registering user:', error);
      alert('An error occurred during registration. Please try again.');
    });
  }
  
  // Check user role and redirect
  function checkUserRoleAndRedirect(uid, expectedRole) {
    fetch('/api/check_user_role', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ uid: uid }),
    })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        if (data.role === expectedRole) {
          // Redirect to the correct dashboard
          window.location.href = data.redirect;
        } else {
          // Alert the user they're trying to log in to the wrong portal
          auth.signOut();
          alert(`You are registered as a ${data.role}, but trying to log in as a ${expectedRole}. Please use the correct portal.`);
        }
      } else {
        alert('Error: ' + data.message);
      }
    })
    .catch((error) => {
      console.error('Error checking user role:', error);
      alert('An error occurred during login. Please try again.');
    });
  }
  
  // Listen for auth state changes
  auth.onAuthStateChanged(user => {
    if (user) {
      // User is signed in
      console.log('User is signed in:', user);
    } else {
      // User is signed out
      console.log('User is signed out');
    }
  });
  
  // Logout function
  function logoutUser() {
    auth.signOut().then(() => {
      // Sign-out successful
      fetch('/api/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          window.location.href = data.redirect;
        }
      })
      .catch(error => {
        console.error('Error during logout:', error);
      });
    }).catch((error) => {
      // An error happened
      console.error('Error during logout:', error);
    });
  }
  
  // Add event listeners for logout buttons
  document.addEventListener('DOMContentLoaded', function() {
    const logoutButtons = document.querySelectorAll('.logout-button, a[href="#logout"]');
    logoutButtons.forEach(button => {
      button.addEventListener('click', function(e) {
        e.preventDefault();
        logoutUser();
      });
    });
  });