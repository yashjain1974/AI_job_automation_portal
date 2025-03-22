// dashboard.js - Fully functional candidate dashboard
console.log('dashboard.js loading');


// logout-fix.js
document.addEventListener('DOMContentLoaded', function() {
    console.log('Setting up logout button handlers');
    
    // Get references to the logout buttons
    const topLogoutButton = document.getElementById('logoutButton');
    const sidebarLogoutButton = document.getElementById('sidebarLogoutButton');
    
    // Function to handle logout
    function handleLogoutClick(e) {
        e.preventDefault();
        console.log('Logout button clicked');
        
        // Show loading indicator if available
        const loadingSpinner = document.getElementById('loadingSpinner');
        if (loadingSpinner) loadingSpinner.style.display = 'block';
        
        // Make POST request to logout API
        fetch('/api/logout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'same-origin' // Important for cookies
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Logout failed: ' + response.status);
            }
            return response.json();
        })
        .then(data => {
            console.log('Logout successful:', data);
            
            if (data.success && data.redirect) {
                // Redirect to the specified URL
                window.location.href = data.redirect;
            } else {
                // Fallback to login page
                window.location.href = '/login';
            }
        })
        .catch(error => {
            console.error('Logout error:', error);
            alert('Logout failed. Please try refreshing the page.');
            
            // Fallback to the login page
            window.location.href = '/login';
        });
    }
    
    // Attach click handlers to logout buttons
    if (topLogoutButton) {
        console.log('Adding event listener to top logout button');
        topLogoutButton.addEventListener('click', handleLogoutClick);
    } else {
        console.warn('Top logout button not found');
    }
    
    if (sidebarLogoutButton) {
        console.log('Adding event listener to sidebar logout button');
        sidebarLogoutButton.addEventListener('click', handleLogoutClick);
    } else {
        console.warn('Sidebar logout button not found');
    }
    
    // Additional failsafe: add event listeners to any elements with data-logout attribute
    document.querySelectorAll('[data-logout]').forEach(element => {
        console.log('Adding event listener to additional logout element:', element);
        element.addEventListener('click', handleLogoutClick);
    });
});

// Wait for document to be fully loaded before initializing
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM fully loaded - initializing dashboard');
    initializeDashboard();
    
    // Check authentication status
    checkAuthStatus();
    
    // Set up event listeners
    setupEventListeners();
});

// Check authentication status
function checkAuthStatus() {
    console.log('Checking authentication status');
    
    // Check if Firebase is available
    if (typeof firebase !== 'undefined' && firebase.auth) {
        firebase.auth().onAuthStateChanged(function(user) {
            if (user) {
                // User is signed in
                console.log('User is logged in:', user.uid);
                loadUserData(user);
                showDashboardContent();
            } else {
                // User is signed out
                console.log('No user is logged in');
                
                // For development, we'll simulate a logged-in user
                if (window.location.hostname === 'localhost') {
                    console.log('Development environment - simulating logged in user');
                    showDashboardContent();
                    // Load mock data
                    loadMockData();
                } else {
                    // Redirect to login page
                    window.location.href = '/login';
                }
            }
        });
    } else {
        console.warn('Firebase not available - proceeding with development mode');
        showDashboardContent();
        // Load mock data
        loadMockData();
    }
}

// Load user data from Firebase Auth
function loadUserData(user) {
    console.log('Loading user data from Firebase Auth');
    
    // Set user name in UI
    const userNameElements = document.querySelectorAll('#userName, #sidebarUserName');
    userNameElements.forEach(element => {
        element.textContent = user.displayName || user.email || 'User';
    });
    
    // Set user email if available
    const emailInput = document.getElementById('email');
    if (emailInput && user.email) {
        emailInput.value = user.email;
    }
    
    // If there's a Firebase auth profile photo, use it
    if (user.photoURL) {
        const profileImages = document.querySelectorAll('.profile-image, .rounded-circle');
        profileImages.forEach(img => {
            img.src = user.photoURL;
        });
    }
    
    // Load dashboard data from server
    loadCandidateData();
}

// Load mock data for development
function loadMockData() {
    console.log('Loading mock data for development');
    
    // Mock user profile
    const mockProfile = {
        firstName: 'John',
        lastName: 'Smith',
        email: 'john.smith@example.com',
        phone: '(555) 123-4567',
        location: 'New York, NY',
        professionalTitle: 'Senior Software Engineer',
        summary: 'Experienced software engineer with over 8 years of experience in frontend and backend development.',
        skills: [
            { id: 'skill1', name: 'JavaScript', level: 'Expert' },
            { id: 'skill2', name: 'React', level: 'Advanced' },
            { id: 'skill3', name: 'Node.js', level: 'Intermediate' },
            { id: 'skill4', name: 'Python', level: 'Beginner' }
        ],
        resumeUrl: null // No resume uploaded yet
    };
    
    // Mock applications
    const mockApplications = [
        { 
            id: 'app1',
            title: 'Frontend Developer', 
            company: 'Tech Innovations Inc.', 
            status: 'reviewing', 
            date: '2025-03-10',
            statusClass: 'bg-info'
        },
        { 
            id: 'app2',
            title: 'Full Stack Engineer', 
            company: 'Digital Solutions', 
            status: 'interview', 
            date: '2025-03-05',
            statusClass: 'bg-primary'
        },
        { 
            id: 'app3',
            title: 'UX Designer', 
            company: 'Creative Studio', 
            status: 'applied', 
            date: '2025-03-14',
            statusClass: 'bg-secondary'
        }
    ];
    
    // Mock jobs
    const mockJobs = [
        {
            id: 'job1',
            title: 'Senior Frontend Developer',
            company: 'TechCorp',
            location: 'Remote',
            salary: '$90,000 - $120,000',
            posted: '2 days ago',
            category: 'Software Development',
            description: 'We are looking for an experienced frontend developer with React expertise.'
        },
        {
            id: 'job2',
            title: 'Full Stack Engineer',
            company: 'InnovateTech',
            location: 'New York, NY',
            salary: '$110,000 - $140,000',
            posted: '1 week ago',
            category: 'Software Development',
            description: 'Join our team to build cutting-edge web applications using modern technologies.'
        },
        {
            id: 'job3',
            title: 'Data Scientist',
            company: 'Analytics Pro',
            location: 'San Francisco, CA',
            salary: '$120,000 - $150,000',
            posted: '3 days ago',
            category: 'Data Science',
            description: 'Seeking a data scientist to analyze large datasets and build predictive models.'
        }
    ];
    
    // Mock assessments
    const mockAssessments = {
        pending: [
            {
                id: 'assessment1',
                title: 'Coding Skills Assessment',
                jobTitle: 'Frontend Developer',
                company: 'Tech Innovations Inc.',
                dueDate: '2025-03-20'
            },
            {
                id: 'assessment2',
                title: 'Technical Interview',
                jobTitle: 'Full Stack Engineer',
                company: 'Digital Solutions',
                dueDate: '2025-03-22'
            }
        ],
        completed: [
            {
                id: 'assessment3',
                title: 'Java Programming Test',
                jobTitle: 'Backend Developer',
                company: 'Software Solutions',
                completionDate: '2025-03-05',
                score: '85%'
            }
        ]
    };
    
    // Set user name
    const userNameElements = document.querySelectorAll('#userName, #sidebarUserName, #profileName');
    const fullName = `${mockProfile.firstName} ${mockProfile.lastName}`;
    userNameElements.forEach(element => {
        if (element) element.textContent = fullName;
    });
    
    // Update dashboard stats
    updateDashboardStats({
        applications: mockApplications.length,
        assessments: mockAssessments.pending.length + mockAssessments.completed.length,
        interviews: mockApplications.filter(app => app.status === 'interview').length,
        offers: mockApplications.filter(app => app.status === 'offered').length
    });
    
    // Load applications
    updateApplicationStatusTable(mockApplications);
    
    // Load recommended jobs
    updateRecommendedJobs(mockJobs);
    
    // Update profile completion
    updateProfileCompletion(60);
    
    // Load upcoming assessments
    updateUpcomingAssessments(mockAssessments.pending);
    
    // Update profile form
    populateProfileForm(mockProfile);
    
    // Store mock data for other sections
    window.mockData = {
        profile: mockProfile,
        applications: mockApplications,
        jobs: mockJobs,
        assessments: mockAssessments
    };
}

// Initialize the dashboard elements and state
function initializeDashboard() {
    console.log('Initializing dashboard components');
    
    // Initialize section visibility
    document.querySelectorAll('section').forEach(section => {
        if (section.id !== 'dashboard-section') {
            section.classList.add('d-none');
        }
    });
    
    // Check if user was previously logged out
    const loggedOut = sessionStorage.getItem('loggedOut');
    if (loggedOut === 'true') {
        console.log('Session indicates previous logout - clearing flag');
        sessionStorage.removeItem('loggedOut');
    }
    
    // Check Firebase configuration
    try {
        if (typeof firebase !== 'undefined' && firebase.app) {
            console.log('Firebase app initialized:', firebase.app().name);
            
            // Check Firebase config
            const firebaseConfig = firebase.app().options;
            if (!firebaseConfig.apiKey || firebaseConfig.apiKey.includes('{{')) {
                console.error('Firebase API key not properly configured:', firebaseConfig.apiKey);
                // This indicates the template wasn't properly rendered
            }
        }
    } catch (error) {
        console.warn('Error checking Firebase config:', error);
    }
}

// Set up all event listeners for the dashboard
function setupEventListeners() {
    console.log('Setting up event listeners');
    
    // Mobile sidebar toggle functionality
    const sidebarToggle = document.getElementById('toggleSidebar');
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', function() {
            console.log('Sidebar toggle clicked');
            const sidebar = document.getElementById('sidebar');
            sidebar.classList.toggle('show');
        });
    }
    
    // Navigation links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            if (this.getAttribute('href') && this.getAttribute('href').startsWith('#')) {
                e.preventDefault();
                console.log('Nav link clicked:', this.getAttribute('href'));
                const targetSection = this.getAttribute('href').substring(1);
                navigateToSection(targetSection);
            }
        });
    });
    
    // LOGOUT FUNCTIONALITY
    console.log('Setting up logout handlers');
    
    // Method 1: Direct ID selectors
    const topLogoutBtn = document.getElementById('logoutButton');
    const sidebarLogoutBtn = document.getElementById('sidebarLogoutButton');
    
    if (topLogoutBtn) {
        console.log('Top logout button found - adding click handler');
        topLogoutBtn.addEventListener('click', handleLogoutClick);
    } else {
        console.warn('Top logout button not found in DOM');
    }
    
    if (sidebarLogoutBtn) {
        console.log('Sidebar logout button found - adding click handler');
        sidebarLogoutBtn.addEventListener('click', handleLogoutClick);
    } else {
        console.warn('Sidebar logout button not found in DOM');
    }
    
    // Method 2: Class-based selector as backup
    const allLogoutButtons = document.querySelectorAll('.logout-btn, [data-action="logout"]');
    console.log('Found', allLogoutButtons.length, 'logout buttons by class/attribute');
    
    allLogoutButtons.forEach(button => {
        button.addEventListener('click', handleLogoutClick);
    });
    
    // Profile form submission
    const personalInfoForm = document.getElementById('personalInfoForm');
    if (personalInfoForm) {
        personalInfoForm.addEventListener('submit', function(e) {
            e.preventDefault();
            savePersonalInfo();
        });
    }
    
    const professionalSummaryForm = document.getElementById('professionalSummaryForm');
    if (professionalSummaryForm) {
        professionalSummaryForm.addEventListener('submit', function(e) {
            e.preventDefault();
            saveProfessionalSummary();
        });
    }
    
    // Upload resume button
    const uploadResumeBtn = document.getElementById('uploadResumeBtn');
    if (uploadResumeBtn) {
        uploadResumeBtn.addEventListener('click', function() {
            // Create a file input element
            const fileInput = document.createElement('input');
            fileInput.type = 'file';
            fileInput.accept = '.pdf,.doc,.docx';
            fileInput.style.display = 'none';
            
            // Add to DOM, click it, and handle the change event
            document.body.appendChild(fileInput);
            fileInput.click();
            
            fileInput.addEventListener('change', function() {
                if (this.files && this.files[0]) {
                    uploadResume(this.files[0]);
                }
                document.body.removeChild(fileInput);
            });
        });
    }
    
    // Add skill button
    const addSkillBtn = document.getElementById('addSkillBtn');
    if (addSkillBtn) {
        addSkillBtn.addEventListener('click', addSkill);
    }
    
    // Application filter buttons
    const applicationFilterButtons = document.querySelectorAll('.btn-group button[data-filter]');
    applicationFilterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            applicationFilterButtons.forEach(btn => btn.classList.remove('active'));
            // Add active class to clicked button
            this.classList.add('active');
            // Filter applications
            filterApplications(this.getAttribute('data-filter'));
        });
    });
    
    // Application sort order
    const applicationSortOrder = document.getElementById('applicationSortOrder');
    if (applicationSortOrder) {
        applicationSortOrder.addEventListener('change', function() {
            sortApplications(this.value);
        });
    }
    
    // Job category filter
    const jobCategoryFilter = document.getElementById('jobCategoryFilter');
    if (jobCategoryFilter) {
        jobCategoryFilter.addEventListener('change', function() {
            filterJobs(this.value);
        });
    }
}

// Navigate between dashboard sections
function navigateToSection(sectionId) {
    console.log('Navigating to section:', sectionId);
    
    // Hide all sections
    document.querySelectorAll('section').forEach(section => {
        section.classList.add('d-none');
    });
    
    // Show the selected section
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.remove('d-none');
    } else {
        console.warn('Target section not found:', sectionId);
        return;
    }
    
    // Update active state in sidebar
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === '#' + sectionId) {
            link.classList.add('active');
        }
    });
    
    // Load section-specific data if needed
    switch (sectionId) {
        case 'jobs-section':
            loadJobsSection();
            break;
        case 'applications-section':
            loadApplicationsSection();
            break;
        case 'assessments-section':
            loadAssessmentsSection();
            break;
        case 'profile-section':
            loadProfileSection();
            break;
    }
}

// Show dashboard content and hide loading spinner
function showDashboardContent() {
    console.log('Showing dashboard content');
    
    // Remove any loading spinners if present
    const loadingSpinners = document.querySelectorAll('.text-center.my-5');
    loadingSpinners.forEach(spinner => {
        if (spinner.querySelector('.spinner-border')) {
            spinner.remove();
        }
    });
}

// Unified handler for logout clicks
function handleLogoutClick(e) {
    console.log('Logout button clicked');
    e.preventDefault();
    handleLogout();
}

// Handle logout process
function handleLogout() {
    console.log('Starting logout process');
    
    // Clear all local storage related to Firebase
    for (let key in localStorage) {
        if (key.includes('firebase') || key.includes('firebaseui')) {
            console.log('Removing localStorage item:', key);
            localStorage.removeItem(key);
        }
    }
    
    // Clear all session storage
    sessionStorage.clear();
    
    // Attempt to remove cookies (for simple cookies only)
    document.cookie.split(";").forEach(function(c) {
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });
    
    // First check if Firebase is initialized properly
    if (typeof firebase !== 'undefined' && firebase.auth) {
        try {
            // Check for common Firebase errors before attempting sign out
            const currentUser = firebase.auth().currentUser;
            console.log('Current Firebase user:', currentUser ? 'Signed in' : 'Not signed in');
            
            // Firebase auth signout - with additional error handling
            console.log('Attempting Firebase signout');
            firebase.auth().signOut()
                .then(() => {
                    console.log('Firebase signout successful');
                    redirectToLogin();
                })
                .catch(error => {
                    console.error('Firebase signout failed:', error);
                    // Continue with redirect even if Firebase fails
                    redirectToLogin();
                });
        } catch (error) {
            console.error('Unexpected error during Firebase logout:', error);
            // Proceed with redirect if any unexpected error occurs
            redirectToLogin();
        }
    } else {
        console.warn('Firebase not available - proceeding with simple logout');
        redirectToLogin();
    }
}

// Redirect to login page
function redirectToLogin() {
    console.log('Redirecting to login page');
    sessionStorage.setItem('loggedOut', 'true');
    
    // For development environment
    if (window.location.hostname === 'localhost') {
        console.log('Development environment - reloading page instead of redirecting');
        window.location.reload();
    } else {
        window.location.href = '/login';
    }
}

// Load candidate profile and applications data
function loadCandidateData() {
    console.log('Loading candidate data from server');
    
    // For development/demo, use mock data
    if (window.location.hostname === 'localhost') {
        console.log('Development environment - using mock data');
        loadMockData();
        return;
    }
    
    // In a production environment, you would fetch from your API
    fetch('/api/candidate/profile')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                updateProfileUI(data.profile);
            } else {
                console.warn('Profile data error:', data.message);
            }
        })
        .catch(error => {
            console.error('Error loading profile:', error);
            // Fallback to mock data if API fails
            loadMockData();
        });
        
    // Fetch applications data
    fetch('/api/candidate/applications')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                updateApplicationsUI(data.applications);
            } else {
                console.warn('Applications data error:', data.message);
            }
        })
        .catch(error => {
            console.error('Error loading applications:', error);
        });
}

// Update dashboard statistics
function updateDashboardStats(stats) {
    console.log('Updating dashboard stats:', stats);
    
    // Update the count displays
    if (stats.applications !== undefined) {
        document.getElementById('applicationsCount').textContent = stats.applications;
    }
    
    if (stats.assessments !== undefined) {
        document.getElementById('assessmentsCount').textContent = stats.assessments;
    }
    
    if (stats.interviews !== undefined) {
        document.getElementById('interviewsCount').textContent = stats.interviews;
    }
    
    if (stats.offers !== undefined) {
        document.getElementById('offersCount').textContent = stats.offers;
    }
}

// Update application status table
function updateApplicationStatusTable(applications) {
    console.log('Updating application status table');
    
    const applicationStatusTable = document.getElementById('applicationStatusTable');
    if (!applicationStatusTable) {
        console.warn('Application status table not found in DOM');
        return;
    }
    
    if (applications.length === 0) {
        applicationStatusTable.innerHTML = `
            <tr>
                <td colspan="4" class="text-center">No applications found</td>
            </tr>
        `;
        return;
    }
    
    // Clear table
    applicationStatusTable.innerHTML = '';
    
    // Add application rows (show up to 3 most recent)
    const recentApplications = applications
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 3);
    
    recentApplications.forEach(app => {
        const row = document.createElement('tr');
        
        // Format the date
        const appDate = new Date(app.date);
        const formattedDate = appDate.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        });
        
        // Status class mapping
        const statusClassMap = {
            'applied': 'bg-secondary',
            'reviewing': 'bg-info',
            'interview': 'bg-primary',
            'offered': 'bg-success',
            'rejected': 'bg-danger'
        };
        
        // Status text mapping
        const statusTextMap = {
            'applied': 'Applied',
            'reviewing': 'In Review',
            'interview': 'Interview',
            'offered': 'Offered',
            'rejected': 'Rejected'
        };
        
        const statusClass = statusClassMap[app.status.toLowerCase()] || 'bg-secondary';
        const statusText = statusTextMap[app.status.toLowerCase()] || 'Applied';
        
        row.innerHTML = `
            <td>${app.title}</td>
            <td>${app.company}</td>
            <td><span class="badge ${statusClass}">${statusText}</span></td>
            <td>${formattedDate}</td>
        `;
        
        applicationStatusTable.appendChild(row);
    });
}

// Update recommended jobs
function updateRecommendedJobs(jobs) {
    console.log('Updating recommended jobs');
    
    const recommendedJobsContainer = document.getElementById('recommendedJobsContainer');
    if (!recommendedJobsContainer) {
        console.warn('Recommended jobs container not found in DOM');
        return;
    }
    
    if (jobs.length === 0) {
        recommendedJobsContainer.innerHTML = `
            <div class="alert alert-info">
                No recommended jobs found at this time.
            </div>
        `;
        return;
    }
    
    // Clear container
    recommendedJobsContainer.innerHTML = '';
    
    // Add job cards (show up to 2 most recent)
    const recentJobs = jobs.slice(0, 2);
    
    recentJobs.forEach(job => {
        const jobCard = document.createElement('div');
        jobCard.className = 'card mb-3';
        jobCard.innerHTML = `
            <div class="card-body">
                <div class="d-flex justify-content-between align-items-center mb-2">
                    <h5 class="card-title mb-0">${job.title}</h5>
                    <span class="badge bg-light text-dark">${job.posted}</span>
                </div>
                <h6 class="card-subtitle mb-2 text-muted">${job.company} · ${job.location}</h6>
                <p class="card-text mb-2">${job.description}</p>
                <p class="text-primary mb-3">${job.salary}</p>
                <div class="d-flex justify-content-end">
                    <button class="btn btn-outline-primary me-2" onclick="viewJobDetails('${job.id}')">View Details</button>
                    <button class="btn btn-primary" onclick="applyToJob('${job.id}')">Apply Now</button>
                </div>
            </div>
        `;
        
        recommendedJobsContainer.appendChild(jobCard);
    });
}

// Update profile completion percentage
function updateProfileCompletion(percentage) {
    console.log('Updating profile completion to', percentage + '%');
    
    const profileCompletionPercentage = document.getElementById('profileCompletionPercentage');
    const profileCompletionBar = document.getElementById('profileCompletionBar');
    
    if (profileCompletionPercentage && profileCompletionBar) {
        profileCompletionPercentage.textContent = `${percentage}%`;
        profileCompletionBar.style.width = `${percentage}%`;
        
        // Change color based on completion percentage
        if (percentage < 30) {
            profileCompletionBar.className = 'progress-bar bg-danger';
        } else if (percentage < 70) {
            profileCompletionBar.className = 'progress-bar bg-warning';
        } else {
            profileCompletionBar.className = 'progress-bar bg-success';
        }
    }
}

// Update upcoming assessments
function updateUpcomingAssessments(assessments) {
    console.log('Updating upcoming assessments');
    
    const upcomingAssessmentsContainer = document.getElementById('upcomingAssessmentsContainer');
    if (!upcomingAssessmentsContainer) {
        console.warn('Upcoming assessments container not found in DOM');
        return;
    }
    
    if (assessments.length === 0) {
        upcomingAssessmentsContainer.innerHTML = `
            <div class="alert alert-info">
                No upcoming assessments found.
            </div>
        `;
        return;
    }
    
    // Clear container
    upcomingAssessmentsContainer.innerHTML = '';
    
    // Add assessment cards (show up to 2)
    const upcomingAssessments = assessments.slice(0, 2);
    
    upcomingAssessments.forEach(assessment => {
        // Format the date
        const dueDate = new Date(assessment.dueDate);
        const formattedDate = dueDate.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        });
        
        const assessmentCard = document.createElement('div');
        assessmentCard.className = 'card mb-2';
        assessmentCard.innerHTML = `
            <div class="card-body">
                <h6 class="card-title">${assessment.title}</h6>
                <p class="card-text text-muted mb-2">
                    ${assessment.jobTitle} at ${assessment.company}
                </p>
                <div class="d-flex justify-content-between align-items-center">
                    <small class="text-danger">Due: ${formattedDate}</small>
                    <button class="btn btn-sm btn-primary" onclick="startAssessment('${assessment.id}')">Start</button>
                </div>
            </div>
        `;
        
        upcomingAssessmentsContainer.appendChild(assessmentCard);
    });
}

// Populate profile form
function populateProfileForm(profile) {
    console.log('Populating profile form');
    
    document.getElementById('firstName').value = profile.firstName || '';
    document.getElementById('lastName').value = profile.lastName || '';
    document.getElementById('email').value = profile.email || '';
    document.getElementById('phone').value = profile.phone || '';
    document.getElementById('location').value = profile.location || '';
    document.getElementById('professionalTitle').value = profile.professionalTitle || '';
    document.getElementById('summary').value = profile.summary || '';
    
    // Update skills section
    updateSkillsDisplay(profile.skills);
    
    // Update resume section
    updateResumeDisplay(profile.resumeUrl);
}

// Update skills display
function updateSkillsDisplay(skills) {
    console.log('Updating skills display');
    
    const skillsContainer = document.getElementById('skillsContainer');
    if (!skillsContainer) {
        console.warn('Skills container not found in DOM');
        return;
    }
    
    if (!skills || skills.length === 0) {
        skillsContainer.innerHTML = `
            <div class="alert alert-info">
                No skills added yet.
            </div>
        `;
        return;
    }
    
    // Clear container
    skillsContainer.innerHTML = '';
    
    // Create skills badges
    skills.forEach(skill => {
        const skillBadge = document.createElement('div');
        skillBadge.className = 'badge bg-light text-dark p-2 m-1 d-inline-flex align-items-center';
        skillBadge.innerHTML = `
            <span>${skill.name}</span>
            <span class="ms-2 badge bg-primary">${skill.level}</span>
            <button class="btn btn-sm text-danger ms-2 p-0" onclick="removeSkill('${skill.id}')">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        skillsContainer.appendChild(skillBadge);
    });
}

// Update resume display
function updateResumeDisplay(resumeUrl) {
    console.log('Updating resume display');
    
    const resumeContainer = document.getElementById('resumeContainer');
    if (!resumeContainer) {
        console.warn('Resume container not found in DOM');
        return;
    }
    
    if (!resumeUrl) {
        resumeContainer.innerHTML = `
            <div class="alert alert-info">
                No resume uploaded yet.
            </div>
        `;
        return;
    }
    
    resumeContainer.innerHTML = `
        <div class="card mb-3">
            <div class="card-body d-flex justify-content-between align-items-center">
                <div>
                    <i class="fas fa-file-pdf text-danger me-2"></i>
                    <span>My Resume.pdf</span>
                </div>
                <div>
                    <a href="${resumeUrl}" class="btn btn-sm btn-outline-primary me-2" target="_blank">
                        <i class="fas fa-eye"></i>
                    </a>
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteResume()">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        </div>
    `;
}

// SECTION LOADING FUNCTIONS

// Load jobs section
function loadJobsSection() {
    console.log('Loading jobs section');
    
    const jobListingsContainer = document.getElementById('jobListingsContainer');
    if (!jobListingsContainer) {
        console.warn('Job listings container not found in DOM');
        return;
    }
    
    // Show loading indicator
    jobListingsContainer.innerHTML = `
        <div class="col-12 text-center py-4">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
            <p>Loading job listings...</p>
        </div>
    `;
    
    // Simulate API delay
    setTimeout(() => {
        // Get mock data or fetch from API
        const jobs = window.mockData?.jobs || [];
        
        if (jobs.length === 0) {
            jobListingsContainer.innerHTML = `
                <div class="col-12">
                    <div class="alert alert-info">
                        No job listings found at this time.
                    </div>
                </div>
            `;
            return;
        }
        
        // Clear container
        jobListingsContainer.innerHTML = '';
        
        // Add job cards
        jobs.forEach(job => {
            const jobCol = document.createElement('div');
            jobCol.className = 'col-md-6 mb-4';
            jobCol.dataset.category = job.category;
            
            const jobCard = document.createElement('div');
            jobCard.className = 'card h-100';
            jobCard.innerHTML = `
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-start mb-2">
                        <h5 class="card-title mb-0">${job.title}</h5>
                        <span class="badge bg-light text-dark">${job.posted}</span>
                    </div>
                    <h6 class="card-subtitle mb-2 text-muted">${job.company}</h6>
                    <p class="mb-1"><i class="fas fa-map-marker-alt text-secondary me-2"></i>${job.location}</p>
                    <p class="text-primary mb-3"><i class="fas fa-money-bill-wave text-secondary me-2"></i>${job.salary}</p>
                    <p class="card-text mb-3">${job.description}</p>
                </div>
                <div class="card-footer bg-white border-top-0">
                    <div class="d-flex justify-content-between">
                        <button class="btn btn-outline-primary" onclick="viewJobDetails('${job.id}')">
                            <i class="fas fa-info-circle me-2"></i>Details
                        </button>
                        <button class="btn btn-primary" onclick="applyToJob('${job.id}')">
                            <i class="fas fa-paper-plane me-2"></i>Apply
                        </button>
                    </div>
                </div>
            `;
            
            jobCol.appendChild(jobCard);
            jobListingsContainer.appendChild(jobCol);
        });
    }, 1000); // Simulate 1-second loading time
}

// Load applications section
function loadApplicationsSection() {
    console.log('Loading applications section');
    
    const applicationsTable = document.getElementById('applicationsTable');
    if (!applicationsTable) {
        console.warn('Applications table not found in DOM');
        return;
    }
    
    // Show loading indicator
    applicationsTable.innerHTML = `
        <tr>
            <td colspan="5" class="text-center">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
                <p class="mt-2">Loading applications...</p>
            </td>
        </tr>
    `;
    
    // Simulate API delay
    setTimeout(() => {
        // Get mock data or fetch from API
        const applications = window.mockData?.applications || [];
        
        // Save applications to global state for filtering
        window.applications = applications;
        
        if (applications.length === 0) {
            applicationsTable.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center">No applications found</td>
                </tr>
            `;
            return;
        }
        
        // Render all applications
        renderApplications(applications);
    }, 1000); // Simulate 1-second loading time
}

// Render applications in the table
function renderApplications(applications) {
    console.log('Rendering applications');
    
    const applicationsTable = document.getElementById('applicationsTable');
    if (!applicationsTable) return;
    
    // Clear table
    applicationsTable.innerHTML = '';
    
    // Status class mapping
    const statusClassMap = {
        'applied': 'bg-secondary',
        'reviewing': 'bg-info',
        'interview': 'bg-primary',
        'offered': 'bg-success',
        'rejected': 'bg-danger'
    };
    
    // Status text mapping
    const statusTextMap = {
        'applied': 'Applied',
        'reviewing': 'In Review',
        'interview': 'Interview',
        'offered': 'Offered',
        'rejected': 'Rejected'
    };
    
    // Add application rows
    applications.forEach(app => {
        const row = document.createElement('tr');
        row.dataset.status = app.status.toLowerCase();
        
        // Format the date
        const appDate = new Date(app.date);
        const formattedDate = appDate.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        });
        
        const statusClass = statusClassMap[app.status.toLowerCase()] || 'bg-secondary';
        const statusText = statusTextMap[app.status.toLowerCase()] || 'Applied';
        
        row.innerHTML = `
            <td>${app.title}</td>
            <td>${app.company}</td>
            <td>${formattedDate}</td>
            <td><span class="badge ${statusClass}">${statusText}</span></td>
            <td>
                <button class="btn btn-sm btn-outline-primary me-1" onclick="viewApplication('${app.id}')">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger" onclick="withdrawApplication('${app.id}')">
                    <i class="fas fa-times"></i>
                </button>
            </td>
        `;
        
        applicationsTable.appendChild(row);
    });
}

// Filter applications by status
function filterApplications(status) {
    console.log('Filtering applications by status:', status);
    
    if (!window.applications) return;
    
    let filteredApplications;
    
    if (status === 'all') {
        filteredApplications = window.applications;
    } else {
        filteredApplications = window.applications.filter(app => 
            app.status.toLowerCase() === status
        );
    }
    
    renderApplications(filteredApplications);
}

// Sort applications by date
function sortApplications(order) {
    console.log('Sorting applications by date:', order);
    
    if (!window.applications) return;
    
    const sortedApplications = [...window.applications];
    
    sortedApplications.sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        
        if (order === 'newest') {
            return dateB - dateA;
        } else {
            return dateA - dateB;
        }
    });
    
    renderApplications(sortedApplications);
}

// Load assessments section
function loadAssessmentsSection() {
    console.log('Loading assessments section');
    
    // Load pending assessments
    loadPendingAssessments();
    
    // Load completed assessments
    loadCompletedAssessments();
}

// Load pending assessments
// Load pending assessments
function loadPendingAssessments() {
    console.log('Loading pending assessments');
    
    const pendingAssessmentsTable = document.getElementById('pendingAssessmentsTable');
    if (!pendingAssessmentsTable) {
        console.warn('Pending assessments table not found in DOM');
        return;
    }
    
    // Get mock data or fetch from API
    // Enhanced mock data with assessment URLs and status
    const pendingAssessments = [
        {
            id: 'assessment1',
            title: 'Coding Skills Assessment',
            jobTitle: 'Frontend Developer',
            company: 'Tech Innovations Inc.',
            dueDate: '2025-03-28',
            status: 'open',
            assessmentUrl: 'http://127.0.0.1:5001/'
        },
        {
            id: 'assessment2',
            title: 'Technical Interview Preparation',
            jobTitle: 'Full Stack Engineer',
            company: 'Digital Solutions',
            dueDate: '2025-03-24',
            status: 'open',
            assessmentUrl: 'http://127.0.0.1:5001/'
        },
        {
            id: 'assessment3',
            title: 'Personality Assessment',
            jobTitle: 'Project Manager',
            company: 'Management Solutions Ltd.',
            dueDate: '2025-03-22',
            status: 'closed',
            assessmentUrl: 'http://127.0.0.1:5001/'
        }
    ];
    
    // Store in mock data
    if (window.mockData) {
        window.mockData.assessments = window.mockData.assessments || {};
        window.mockData.assessments.pending = pendingAssessments;
    }
    
    if (pendingAssessments.length === 0) {
        pendingAssessmentsTable.innerHTML = `
            <tr>
                <td colspan="5" class="text-center">No pending assessments</td>
            </tr>
        `;
        return;
    }
    
    // Clear table
    pendingAssessmentsTable.innerHTML = '';
    
    // Add assessment rows
    pendingAssessments.forEach(assessment => {
        // Format the date
        const dueDate = new Date(assessment.dueDate);
        const formattedDate = dueDate.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        });
        
        // Determine if assessment is past due
        const isPastDue = new Date() > dueDate;
        const statusClass = assessment.status === 'open' ? 'bg-success' : 'bg-danger';
        const statusText = assessment.status === 'open' ? 'Open' : 'Closed';
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${assessment.title}</td>
            <td>${assessment.jobTitle}</td>
            <td>${assessment.company}</td>
            <td>${formattedDate}</td>
            <td>
                <span class="badge ${statusClass} me-2">${statusText}</span>
                ${assessment.status === 'open' ? 
                    `<a href="${assessment.assessmentUrl}" target="_blank" class="btn btn-sm btn-primary">
                        Start
                    </a>` : 
                    `<button class="btn btn-sm btn-secondary" disabled>
                        Unavailable
                    </button>`
                }
            </td>
        `;
        
        pendingAssessmentsTable.appendChild(row);
    });
    
    // Update the assessments count in the dashboard
    const assessmentsCount = document.getElementById('assessmentsCount');
    if (assessmentsCount) {
        const totalAssessments = pendingAssessments.length + 
            (window.mockData?.assessments?.completed?.length || 0);
        assessmentsCount.textContent = totalAssessments;
    }
    
    // Update upcoming assessments on dashboard
    const openAssessments = pendingAssessments.filter(a => a.status === 'open');
    updateUpcomingAssessments(openAssessments);
}

// Load completed assessments
function loadCompletedAssessments() {
    console.log('Loading completed assessments');
    
    const completedAssessmentsTable = document.getElementById('completedAssessmentsTable');
    if (!completedAssessmentsTable) {
        console.warn('Completed assessments table not found in DOM');
        return;
    }
    
    // Enhanced mock data for completed assessments
    const completedAssessments = [
        {
            id: 'assessment4',
            title: 'Java Programming Test',
            jobTitle: 'Backend Developer',
            company: 'Software Solutions',
            completionDate: '2025-03-05',
            score: '85%',
            reportUrl: 'http://127.0.0.1:5001/'
        },
        {
            id: 'assessment5',
            title: 'UI/UX Design Challenge',
            jobTitle: 'UX Designer',
            company: 'Creative Studio',
            completionDate: '2025-02-28',
            score: '92%',
            reportUrl: 'http://127.0.0.1:5001/'
        }
    ];
    
    // Store in mock data
    if (window.mockData) {
        window.mockData.assessments = window.mockData.assessments || {};
        window.mockData.assessments.completed = completedAssessments;
    }
    
    if (completedAssessments.length === 0) {
        completedAssessmentsTable.innerHTML = `
            <tr>
                <td colspan="5" class="text-center">No completed assessments</td>
            </tr>
        `;
        return;
    }
    
    // Clear table
    completedAssessmentsTable.innerHTML = '';
    
    // Add assessment rows
    completedAssessments.forEach(assessment => {
        // Format the date
        const completionDate = new Date(assessment.completionDate);
        const formattedDate = completionDate.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        });
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${assessment.title}</td>
            <td>${assessment.jobTitle}</td>
            <td>${assessment.company}</td>
            <td>${formattedDate}</td>
            <td>
                <span class="badge bg-success">${assessment.score}</span>
                <a href="${assessment.reportUrl}" target="_blank" class="btn btn-sm btn-outline-primary ms-2">
                    <i class="fas fa-file-alt"></i> Report
                </a>
            </td>
        `;
        
        completedAssessmentsTable.appendChild(row);
    });
}

// Update upcoming assessments widget on dashboard
function updateUpcomingAssessments(assessments) {
    console.log('Updating upcoming assessments');
    
    const upcomingAssessmentsContainer = document.getElementById('upcomingAssessmentsContainer');
    if (!upcomingAssessmentsContainer) {
        console.warn('Upcoming assessments container not found in DOM');
        return;
    }
    
    if (!assessments || assessments.length === 0) {
        upcomingAssessmentsContainer.innerHTML = `
            <div class="alert alert-info">
                No upcoming assessments found.
            </div>
        `;
        return;
    }
    
    // Clear container
    upcomingAssessmentsContainer.innerHTML = '';
    
    // Sort by due date and show only open assessments
    const upcomingAssessments = assessments
        .filter(a => a.status === 'open')
        .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
        .slice(0, 2);
    
    upcomingAssessments.forEach(assessment => {
        // Format the date
        const dueDate = new Date(assessment.dueDate);
        const formattedDate = dueDate.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        });
        
        // Calculate days remaining
        const today = new Date();
        const timeDiff = dueDate.getTime() - today.getTime();
        const daysRemaining = Math.ceil(timeDiff / (1000 * 3600 * 24));
        
        const assessmentCard = document.createElement('div');
        assessmentCard.className = 'card mb-2';
        assessmentCard.innerHTML = `
            <div class="card-body">
                <h6 class="card-title">${assessment.title}</h6>
                <p class="card-text text-muted mb-2">
                    ${assessment.jobTitle} at ${assessment.company}
                </p>
                <div class="d-flex justify-content-between align-items-center">
                    <small class="${daysRemaining <= 2 ? 'text-danger' : 'text-warning'}">
                        Due: ${formattedDate} (${daysRemaining} days)
                    </small>
                    <a href="${assessment.assessmentUrl}" target="_blank" class="btn btn-sm btn-primary">Start</a>
                </div>
            </div>
        `;
        
        upcomingAssessmentsContainer.appendChild(assessmentCard);
    });
}

// Launch assessment by redirecting to the assessment URL
function startAssessment(assessmentId) {
    console.log('Starting assessment:', assessmentId);
    
    // Find the assessment in the mock data
    const assessment = window.mockData?.assessments?.pending?.find(a => a.id === assessmentId);
    
    if (!assessment) {
        alert('Assessment not found');
        return;
    }
    
    if (assessment.status !== 'open') {
        alert('This assessment is not currently available.');
        return;
    }
    
    // Create a modal to confirm starting the assessment
    const modalHtml = `
        <div class="modal fade" id="startAssessmentModal" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Start Assessment</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <h6>${assessment.title}</h6>
                        <p class="text-muted mb-3">${assessment.jobTitle} at ${assessment.company}</p>
                        
                        <div class="alert alert-info">
                            <i class="fas fa-info-circle me-2"></i>
                            Please ensure you have 30-45 minutes of uninterrupted time to complete this assessment.
                        </div>
                        
                        <p><strong>Due Date:</strong> ${new Date(assessment.dueDate).toLocaleDateString()}</p>
                        <p><strong>Status:</strong> <span class="badge bg-success">Open</span></p>
                        <p><strong>Format:</strong> Multiple choice and coding questions</p>
                        <p><strong>Time Limit:</strong> 45 minutes</p>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                        <a href="${assessment.assessmentUrl}" target="_blank" class="btn btn-primary">Start Now</a>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Add modal to the DOM
    const modalContainer = document.createElement('div');
    modalContainer.innerHTML = modalHtml;
    document.body.appendChild(modalContainer);
    
    // Initialize the modal
    const modal = new bootstrap.Modal(document.getElementById('startAssessmentModal'));
    modal.show();
    
    // Clean up when modal is hidden
    document.getElementById('startAssessmentModal').addEventListener('hidden.bs.modal', function() {
        document.body.removeChild(modalContainer);
    });
}

// Initialize the start assessment button functionality for global usage
window.startAssessment = startAssessment;

// Load profile section
function loadProfileSection() {
    console.log('Loading profile section');
    
    // Get mock data or fetch from API
    const profile = window.mockData?.profile || {};
    
    // Populate form fields
    populateProfileForm(profile);
}

// ACTION FUNCTIONS

// Save personal information
function savePersonalInfo() {
    console.log('Saving personal information');
    
    // Get form values
    const firstName = document.getElementById('firstName').value;
    const lastName = document.getElementById('lastName').value;
    const phone = document.getElementById('phone').value;
    const location = document.getElementById('location').value;
    
    // Validate form
    if (!firstName || !lastName) {
        alert('Please fill in all required fields.');
        return;
    }
    
    // Show saving indication
    const saveButton = document.querySelector('#personalInfoForm button[type="submit"]');
    const originalText = saveButton.innerHTML;
    saveButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Saving...';
    saveButton.disabled = true;
    
    // Simulate API delay
    setTimeout(() => {
        // Update mock data
        if (window.mockData && window.mockData.profile) {
            window.mockData.profile.firstName = firstName;
            window.mockData.profile.lastName = lastName;
            window.mockData.profile.phone = phone;
            window.mockData.profile.location = location;
        }
        
        // Update user display name
        const fullName = `${firstName} ${lastName}`;
        document.querySelectorAll('#userName, #sidebarUserName, #profileName').forEach(element => {
            if (element) element.textContent = fullName;
        });
        
        // Reset button
        saveButton.innerHTML = originalText;
        saveButton.disabled = false;
        
        // Show success message
        alert('Personal information saved successfully!');
        
        // Update profile completion
        updateProfileCompletion(75);
    }, 1500);
}

// Save professional summary
function saveProfessionalSummary() {
    console.log('Saving professional summary');
    
    // Get form values
    const professionalTitle = document.getElementById('professionalTitle').value;
    const summary = document.getElementById('summary').value;
    
    // Show saving indication
    const saveButton = document.querySelector('#professionalSummaryForm button[type="submit"]');
    const originalText = saveButton.innerHTML;
    saveButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Saving...';
    saveButton.disabled = true;
    
    // Simulate API delay
    setTimeout(() => {
        // Update mock data
        if (window.mockData && window.mockData.profile) {
            window.mockData.profile.professionalTitle = professionalTitle;
            window.mockData.profile.summary = summary;
        }
        
        // Reset button
        saveButton.innerHTML = originalText;
        saveButton.disabled = false;
        
        // Show success message
        alert('Professional summary saved successfully!');
        
        // Update profile completion
        updateProfileCompletion(85);
    }, 1500);
}

// Add a new skill
function addSkill() {
    console.log('Adding new skill');
    
    // Create a modal for adding a new skill
    const modalHtml = `
        <div class="modal fade" id="addSkillModal" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Add New Skill</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <form id="addSkillForm">
                            <div class="mb-3">
                                <label class="form-label">Skill Name</label>
                                <input type="text" class="form-control" id="skillName" required>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Proficiency Level</label>
                                <select class="form-select" id="skillLevel" required>
                                    <option value="">Select level</option>
                                    <option value="Beginner">Beginner</option>
                                    <option value="Intermediate">Intermediate</option>
                                    <option value="Advanced">Advanced</option>
                                    <option value="Expert">Expert</option>
                                </select>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                        <button type="button" class="btn btn-primary" id="saveSkillBtn">Add Skill</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Add modal to the DOM
    const modalContainer = document.createElement('div');
    modalContainer.innerHTML = modalHtml;
    document.body.appendChild(modalContainer);
    
    // Initialize the modal
    const modal = new bootstrap.Modal(document.getElementById('addSkillModal'));
    modal.show();
    
    // Handle save button click
    document.getElementById('saveSkillBtn').addEventListener('click', function() {
        const skillName = document.getElementById('skillName').value;
        const skillLevel = document.getElementById('skillLevel').value;
        
        if (skillName && skillLevel) {
            // Generate a random ID for the new skill
            const skillId = 'skill_' + Date.now();
            
            // Get existing skills or initialize empty array
            const existingSkills = window.mockData?.profile?.skills || [];
            
            // Add new skill
            const newSkill = {
                id: skillId,
                name: skillName,
                level: skillLevel
            };
            
            const updatedSkills = [...existingSkills, newSkill];
            
            // Update mock data
            if (window.mockData && window.mockData.profile) {
                window.mockData.profile.skills = updatedSkills;
            }
            
            // Update the display
            updateSkillsDisplay(updatedSkills);
            
            // Close the modal
            modal.hide();
            
            // Clean up
            setTimeout(() => {
                document.body.removeChild(modalContainer);
            }, 500);
            
            // Update profile completion
            updateProfileCompletion(90);
        } else {
            alert('Please fill in all required fields.');
        }
    });
}

// Remove a skill
function removeSkill(skillId) {
    console.log('Removing skill:', skillId);
    
    if (!window.mockData || !window.mockData.profile || !window.mockData.profile.skills) return;
    
    // Confirm deletion
    if (!confirm('Are you sure you want to remove this skill?')) return;
    
    // Filter out the skill to remove
    const updatedSkills = window.mockData.profile.skills.filter(skill => skill.id !== skillId);
    
    // Update mock data
    window.mockData.profile.skills = updatedSkills;
    
    // Update the display
    updateSkillsDisplay(updatedSkills);
    
    // Update profile completion
    updateProfileCompletion(updatedSkills.length > 0 ? 85 : 75);
}

// Upload resume
function uploadResume(file) {
    console.log('Uploading resume:', file.name);
    
    // Show loading indication
    const resumeContainer = document.getElementById('resumeContainer');
    if (resumeContainer) {
        resumeContainer.innerHTML = `
            <div class="text-center py-3">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Uploading...</span>
                </div>
                <p class="mt-2">Uploading resume...</p>
            </div>
        `;
    }
    
    // Simulate a successful upload after a delay
    setTimeout(() => {
        // Simulate a resume URL
        const resumeUrl = '#';
        
        // Update mock data
        if (window.mockData && window.mockData.profile) {
            window.mockData.profile.resumeUrl = resumeUrl;
        }
        
        // Update the display
        updateResumeDisplay(resumeUrl);
        
        // Update profile completion
        updateProfileCompletion(100);
    }, 2000);
}

// Delete resume
function deleteResume() {
    console.log('Deleting resume');
    
    // Confirm deletion
    if (!confirm('Are you sure you want to delete your resume?')) return;
    
    // Update mock data
    if (window.mockData && window.mockData.profile) {
        window.mockData.profile.resumeUrl = null;
    }
    
    // Update the display
    updateResumeDisplay(null);
    
    // Update profile completion
    updateProfileCompletion(85);
}

// View job details
function viewJobDetails(jobId) {
    console.log('Viewing job details:', jobId);
    
    // Find the job in the mock data
    const job = window.mockData?.jobs?.find(j => j.id === jobId);
    
    if (!job) {
        alert('Job not found');
        return;
    }
    
    // Create a modal to display job details
    const modalHtml = `
        <div class="modal fade" id="jobDetailsModal" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">${job.title}</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <div class="mb-3">
                            <h6 class="text-muted">${job.company} · ${job.location}</h6>
                            <span class="badge bg-light text-dark">Posted ${job.posted}</span>
                            <p class="text-primary mt-2">${job.salary}</p>
                        </div>
                        <h6>Job Description</h6>
                        <p>${job.description}</p>
                        <h6>Qualifications</h6>
                        <ul>
                            <li>Bachelor's degree in Computer Science or related field</li>
                            <li>3+ years of experience in software development</li>
                            <li>Proficiency in modern web technologies</li>
                            <li>Strong problem-solving and communication skills</li>
                        </ul>
                        <h6>Benefits</h6>
                        <ul>
                            <li>Competitive salary and bonus structure</li>
                            <li>Comprehensive health, dental, and vision insurance</li>
                            <li>401(k) with employer match</li>
                            <li>Flexible work arrangements</li>
                            <li>Professional development opportunities</li>
                        </ul>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                        <button type="button" class="btn btn-primary" onclick="applyToJobFromModal('${job.id}')">Apply Now</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Add modal to the DOM
    const modalContainer = document.createElement('div');
    modalContainer.innerHTML = modalHtml;
    document.body.appendChild(modalContainer);
    
    // Initialize the modal
    const modal = new bootstrap.Modal(document.getElementById('jobDetailsModal'));
    modal.show();
    
    // Clean up when modal is hidden
    document.getElementById('jobDetailsModal').addEventListener('hidden.bs.modal', function() {
        document.body.removeChild(modalContainer);
    });
}

// Apply to job from the modal
function applyToJobFromModal(jobId) {
    console.log('Applying to job from modal:', jobId);
    
    // Close the modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('jobDetailsModal'));
    if (modal) modal.hide();
    
    // Apply to the job
    applyToJob(jobId);
}

// Apply to job
function applyToJob(jobId) {
    console.log('Applying to job:', jobId);
    
    // Find the job in the mock data
    const job = window.mockData?.jobs?.find(j => j.id === jobId);
    
    if (!job) {
        alert('Job not found');
        return;
    }
    
    // Check if already applied
    const alreadyApplied = window.mockData?.applications?.some(a => 
        a.id.includes(jobId) || (a.job && a.job.id === jobId)
    );
    
    if (alreadyApplied) {
        alert('You have already applied for this job.');
        return;
    }
    
    // Confirm application
    if (!confirm(`Are you sure you want to apply for "${job.title}" at ${job.company}?`)) return;
    
    // Create a new application
    const newApplication = {
        id: 'app_' + jobId + '_' + Date.now(),
        title: job.title,
        company: job.company,
        status: 'applied',
        date: new Date().toISOString().split('T')[0],
        statusClass: 'bg-secondary'
    };
    
    // Add to mock data
    if (window.mockData) {
        if (!window.mockData.applications) {
            window.mockData.applications = [];
        }
        window.mockData.applications.push(newApplication);
        window.applications = window.mockData.applications;
        
        // Update applications count
        const applicationsCount = window.mockData.applications.length;
        const applicationsCountElements = document.querySelectorAll('#applicationsCount');
        applicationsCountElements.forEach(element => {
            if (element) element.textContent = applicationsCount;
        });
        
        // Update application status table
        updateApplicationStatusTable(window.mockData.applications);
        
        // Update applications section if visible
        if (!document.getElementById('applications-section').classList.contains('d-none')) {
            loadApplicationsSection();
        }
    }
    
    // Show success message
    alert('Application submitted successfully!');
}

// View application details
function viewApplication(applicationId) {
    console.log('Viewing application details:', applicationId);
    
    // Find the application in the mock data
    const application = window.mockData?.applications?.find(a => a.id === applicationId);
    
    if (!application) {
        alert('Application not found');
        return;
    }
    
    // Create a modal to display application details
    const modalHtml = `
        <div class="modal fade" id="applicationDetailsModal" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Application Details</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <h6 class="mb-1">${application.title}</h6>
                        <p class="text-muted mb-3">${application.company}</p>
                        
                        <div class="mb-3">
                            <strong>Status:</strong>
                            <span class="badge ${application.statusClass}">${application.status}</span>
                        </div>
                        
                        <div class="mb-3">
                            <strong>Applied Date:</strong>
                            <p>${new Date(application.date).toLocaleDateString()}</p>
                        </div>
                        
                        <div class="mb-3">
                            <strong>Application History:</strong>
                            <ul class="list-group list-group-flush">
                                <li class="list-group-item">
                                    <small class="text-muted">${new Date(application.date).toLocaleDateString()}</small>
                                    <p class="mb-0">Application submitted</p>
                                </li>
                                ${application.status !== 'applied' ? `
                                <li class="list-group-item">
                                    <small class="text-muted">${new Date(new Date(application.date).getTime() + 86400000 * 2).toLocaleDateString()}</small>
                                    <p class="mb-0">Application under review</p>
                                </li>
                                ` : ''}
                                ${application.status === 'interview' ? `
                                <li class="list-group-item">
                                    <small class="text-muted">${new Date(new Date(application.date).getTime() + 86400000 * 4).toLocaleDateString()}</small>
                                    <p class="mb-0">Interview scheduled</p>
                                </li>
                                ` : ''}
                            </ul>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                        <button type="button" class="btn btn-danger" onclick="withdrawApplicationFromModal('${application.id}')">Withdraw Application</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Add modal to the DOM
    const modalContainer = document.createElement('div');
    modalContainer.innerHTML = modalHtml;
    document.body.appendChild(modalContainer);
    
    // Initialize the modal
    const modal = new bootstrap.Modal(document.getElementById('applicationDetailsModal'));
    modal.show();
    
    // Clean up when modal is hidden
    document.getElementById('applicationDetailsModal').addEventListener('hidden.bs.modal', function() {
        document.body.removeChild(modalContainer);
    });
}

// Withdraw application from modal
function withdrawApplicationFromModal(applicationId) {
    console.log('Withdrawing application from modal:', applicationId);
    
    // Close the modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('applicationDetailsModal'));
    if (modal) modal.hide();
    
    // Withdraw the application
    withdrawApplication(applicationId);
}

// Withdraw application
function withdrawApplication(applicationId) {
    console.log('Withdrawing application:', applicationId);
    
    // Confirm withdrawal
    if (!confirm('Are you sure you want to withdraw this application? This action cannot be undone.')) return;
    
    // Remove the application from the mock data
    if (window.mockData && window.mockData.applications) {
        const index = window.mockData.applications.findIndex(a => a.id === applicationId);
        if (index !== -1) {
            window.mockData.applications.splice(index, 1);
            window.applications = window.mockData.applications;
            
            // Update applications count
            const applicationsCount = window.mockData.applications.length;
            const applicationsCountElements = document.querySelectorAll('#applicationsCount');
            applicationsCountElements.forEach(element => {
                if (element) element.textContent = applicationsCount;
            });
            
            // Update application status table
            updateApplicationStatusTable(window.mockData.applications);
            
            // Update applications section if visible
            if (!document.getElementById('applications-section').classList.contains('d-none')) {
                renderApplications(window.mockData.applications);
            }
            
            // Show success message
            alert('Application withdrawn successfully.');
        }
    }
}

// Start assessment
function startAssessment(assessmentId) {
    console.log('Starting assessment:', assessmentId);
    
    // Find the assessment in the mock data
    const assessment = window.mockData?.assessments?.pending?.find(a => a.id === assessmentId);
    
    if (!assessment) {
        alert('Assessment not found');
        return;
    }
    
    // Create a modal to confirm starting the assessment
    const modalHtml = `
        <div class="modal fade" id="startAssessmentModal" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Start Assessment</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <h6>${assessment.title}</h6>
                        <p class="text-muted mb-3">${assessment.jobTitle} at ${assessment.company}</p>
                        
                        <div class="alert alert-info">
                            <i class="fas fa-info-circle me-2"></i>
                            Please ensure you have 30-45 minutes of uninterrupted time to complete this assessment.
                        </div>
                        
                        <p><strong>Due Date:</strong> ${new Date(assessment.dueDate).toLocaleDateString()}</p>
                        <p><strong>Format:</strong> Multiple choice and coding questions</p>
                        <p><strong>Time Limit:</strong> 45 minutes</p>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                        <button type="button" class="btn btn-primary" onclick="launchAssessment('${assessment.id}')">Start Now</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Add modal to the DOM
    const modalContainer = document.createElement('div');
    modalContainer.innerHTML = modalHtml;
    document.body.appendChild(modalContainer);
    
    // Initialize the modal
    const modal = new bootstrap.Modal(document.getElementById('startAssessmentModal'));
    modal.show();
    
    // Clean up when modal is hidden
    document.getElementById('startAssessmentModal').addEventListener('hidden.bs.modal', function() {
        document.body.removeChild(modalContainer);
    });
}

// Launch assessment
function launchAssessment(assessmentId) {
    console.log('Launching assessment:', assessmentId);
    
    // Close the modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('startAssessmentModal'));
    if (modal) modal.hide();
    
    // Simulate redirecting to assessment platform
    alert('Redirecting to assessment platform. Good luck!');
}

// Filter jobs by category
function filterJobs(category) {
    console.log('Filtering jobs by category:', category);
    
    const jobItems = document.querySelectorAll('#jobListingsContainer > div');
    
    jobItems.forEach(item => {
        if (!category || category === '' || item.dataset.category === category) {
            item.style.display = '';
        } else {
            item.style.display = 'none';
        }
    });
}

// Initialize the dashboard
console.log('dashboard.js loaded successfully');