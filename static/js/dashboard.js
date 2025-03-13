// dashboard.js
console.log('dashboard.js has been loaded successfully');
document.addEventListener('DOMContentLoaded', function() {
    // Initialize the dashboard
    initializeDashboard();
    
    // Load candidate data
    loadCandidateData();
    
    // Load jobs
    loadJobs();
});

// Initialize dashboard components and event listeners
function initializeDashboard() {
    const loggedOut = sessionStorage.getItem('loggedOut');
    if (loggedOut === 'true') {
        // Clear the flag
        sessionStorage.removeItem('loggedOut');
        // Make sure we're really logged out of Firebase
        firebase.auth().signOut();
    }
    // Toggle sidebar on mobile
    document.getElementById('toggleSidebar').addEventListener('click', function() {
        const sidebar = document.getElementById('sidebar');
        const mainContent = document.getElementById('main-content');
        
        sidebar.classList.toggle('show');
        
        if (sidebar.classList.contains('show')) {
            mainContent.style.marginLeft = '250px';
        } else {
            mainContent.style.marginLeft = '0';
        }
    });
    
    // Navigation between sections
    const navLinks = document.querySelectorAll('.sidebar .nav-link');
    const sections = document.querySelectorAll('section');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all links
            navLinks.forEach(link => link.classList.remove('active'));
            
            // Add active class to clicked link
            this.classList.add('active');
            
            // Hide all sections
            sections.forEach(section => section.classList.add('d-none'));
            
            // Show the selected section
            const targetId = this.getAttribute('href');
            document.querySelector(targetId).classList.remove('d-none');
        });
    });
    
    // Logout functionality
    const logoutButtons = document.querySelectorAll('#logoutButton, #sidebarLogoutButton');
    
    logoutButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            handleLogout();
        });
    });
}

// Handle logout process
function handleLogout() {
    // Show loading
    document.getElementById('loadingSpinner').style.display = 'block';
    document.getElementById('dashboardContent').style.display = 'none';
    
    // First sign out from Firebase
    firebase.auth().signOut().then(() => {
        // Then call your server logout endpoint
        return fetch('/api/logout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            }
        });
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            sessionStorage.setItem('loggedOut', 'true');
        window.location.href = data.redirect;
        } else {
            alert('Logout failed. Please try again.');
            document.getElementById('loadingSpinner').style.display = 'none';
            document.getElementById('dashboardContent').style.display = 'block';
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('An error occurred. Please try again.');
        document.getElementById('loadingSpinner').style.display = 'none';
        document.getElementById('dashboardContent').style.display = 'block';
    });
}

// Load candidate profile and applications data
function loadCandidateData() {
    // Fetch profile data
    fetch('/api/candidate/profile')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                updateProfileUI(data.profile);
            }
        })
        .catch(error => {
            console.error('Error loading profile:', error);
        });
        
    // Fetch applications data
    fetch('/api/candidate/applications')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                updateApplicationsUI(data.applications);
            }
        })
        .catch(error => {
            console.error('Error loading applications:', error);
        });
}

// Update UI with profile data
function updateProfileUI(profile) {
    // Update profile name
    const profileNameElements = document.querySelectorAll('#profileName, #userName, #sidebarUserName');
    profileNameElements.forEach(element => {
        element.textContent = profile.displayName || 'User';
    });
    
    // Update profile title if exists
    if (profile.title) {
        document.getElementById('profileTitle').textContent = profile.title;
    }
    
    // Update profile completion percentage
    // This would be a calculation based on how complete their profile is
    // For example, checking if they have resume, skills, education, experience, etc.
    
    // If profile has an image, update the profile images
    if (profile.profileImage) {
        const profileImages = document.querySelectorAll('.profile-img, .avatar-sm');
        profileImages.forEach(img => {
            img.src = profile.profileImage;
        });
    }
    
    // If profile has location, update the location display
    if (profile.location) {
        const locationElements = document.querySelectorAll('.profile-location');
        locationElements.forEach(element => {
            element.textContent = profile.location;
        });
    }
}

// Update UI with applications data
function updateApplicationsUI(applications) {
    const applicationsCount = applications.length;
    const applicationsCountElements = document.querySelectorAll('#applicationsCount, #profileApplicationsCount');
    applicationsCountElements.forEach(element => {
        element.textContent = applicationsCount;
    });
    
    const interviewsCount = applications.filter(app => app.status === 'interview').length;
    document.getElementById('interviewsCount').textContent = interviewsCount;
    
    const offersCount = applications.filter(app => app.status === 'offered').length;
    document.getElementById('offersCount').textContent = offersCount;
    
    // Update recent applications container
    const applicationsContainer = document.getElementById('applicationsContainer');
    const noApplicationsMessage = document.getElementById('noApplicationsMessage');
    
    if (applicationsCount > 0) {
        noApplicationsMessage.style.display = 'none';
        applicationsContainer.innerHTML = '';
        
        // Display the 3 most recent applications
        const recentApplications = applications.sort((a, b) => {
            return new Date(b.appliedAt) - new Date(a.appliedAt);
        }).slice(0, 3);
        
        recentApplications.forEach(app => {
            const jobTitle = app.job ? app.job.title : 'Unknown Position';
            const companyName = app.job ? app.job.company : 'Unknown Company';
            const location = app.job ? app.job.location : '';
            const statusMap = {
                'applied': 'Applied',
                'reviewing': 'Under Review',
                'interview': 'Interview Scheduled',
                'offered': 'Job Offered',
                'rejected': 'Not Selected'
            };
            const statusClass = {
                'applied': 'bg-info',
                'reviewing': 'bg-warning text-dark',
                'interview': 'bg-primary',
                'offered': 'bg-success',
                'rejected': 'bg-danger'
            };
            const statusText = statusMap[app.status] || 'Applied';
            const statusBadgeClass = statusClass[app.status] || 'bg-info';
            
            // Format date
            const appliedDate = app.appliedAt ? new Date(app.appliedAt.seconds * 1000) : new Date();
            const formattedDate = appliedDate.toLocaleDateString();
            
            const applicationHtml = `
                <div class="application-card card mb-3">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-start">
                            <div>
                                <h5 class="card-title mb-1">${jobTitle}</h5>
                                <p class="text-muted mb-2">${companyName} ${location ? ' - ' + location : ''}</p>
                                <span class="badge ${statusBadgeClass}">${statusText}</span>
                                <small class="text-muted ms-2">Applied on ${formattedDate}</small>
                            </div>
                            <button class="btn btn-sm btn-outline-primary" data-application-id="${app.id}">View Details</button>
                        </div>
                    </div>
                </div>
            `;
            
            applicationsContainer.innerHTML += applicationHtml;
        });
        
        // Add event listeners to view details buttons
        document.querySelectorAll('[data-application-id]').forEach(button => {
            button.addEventListener('click', function() {
                const applicationId = this.getAttribute('data-application-id');
                // Implement view application details functionality
                alert('View application details for ID: ' + applicationId);
            });
        });
    } else {
        noApplicationsMessage.style.display = 'block';
    }
    
    // Update interviews container
    const interviewsContainer = document.getElementById('interviewsContainer');
    const noInterviewsMessage = document.getElementById('noInterviewsMessage');
    
    if (interviewsCount > 0) {
        noInterviewsMessage.style.display = 'none';
        interviewsContainer.style.display = 'block';
        interviewsContainer.innerHTML = '';
        
        const interviewApplications = applications.filter(app => app.status === 'interview');
        
        interviewApplications.forEach(app => {
            const jobTitle = app.job ? app.job.title : 'Unknown Position';
            const companyName = app.job ? app.job.company : 'Unknown Company';
            
            // If there's interview date information
            let interviewDate = 'Upcoming';
            let formattedDate = '';
            if (app.interviewDate) {
                const date = new Date(app.interviewDate.seconds * 1000);
                const month = date.toLocaleString('default', { month: 'short' }).toUpperCase();
                const day = date.getDate();
                formattedDate = `${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
                interviewDate = `
                    <div class="bg-light p-2 rounded me-3 text-center" style="min-width: 50px;">
                        <div class="small">${month}</div>
                        <div class="fw-bold">${day}</div>
                    </div>
                `;
            }
            
            const interviewHtml = `
                <div class="d-flex mb-3 pb-3 border-bottom">
                    ${interviewDate}
                    <div>
                        <h6 class="mb-1">${companyName} - Interview</h6>
                        <p class="text-muted small mb-1">${jobTitle}</p>
                        <small><i class="fas fa-clock me-1"></i> ${formattedDate}</small>
                    </div>
                </div>
            `;
            
            interviewsContainer.innerHTML += interviewHtml;
        });
    } else {
        noInterviewsMessage.style.display = 'block';
        interviewsContainer.style.display = 'none';
    }
    
    // Update all applications container (for the Applications section)
    const allApplicationsContainer = document.getElementById('allApplicationsContainer');
    if (applicationsCount > 0) {
        allApplicationsContainer.innerHTML = '<div class="text-center py-3 mb-3"><strong>Total Applications: ' + applicationsCount + '</strong></div>';
        
        // Implement full applications list display logic here
        // This would be expanded when building out the full applications section
    } else {
        allApplicationsContainer.innerHTML = `
            <div class="text-center py-5 text-muted">
                <i class="fas fa-file-alt fa-3x mb-3"></i>
                <h5>No applications yet</h5>
                <p>Start applying to jobs to see your applications here.</p>
                <button class="btn btn-primary">Browse Jobs</button>
            </div>
        `;
    }
}

// Load available jobs
function loadJobs() {
    document.getElementById('loadingJobs').style.display = 'block';
    
    fetch('/api/candidate/jobs')
        .then(response => response.json())
        .then(data => {
            document.getElementById('loadingJobs').style.display = 'none';
            
            if (data.success) {
                updateJobsUI(data.jobs);
            }
        })
        .catch(error => {
            console.error('Error loading jobs:', error);
            document.getElementById('loadingJobs').style.display = 'none';
            
            // Display error message
            document.getElementById('jobsContainer').innerHTML = `
                <div class="text-center py-4 text-muted">
                    <i class="fas fa-exclamation-circle fa-3x mb-3"></i>
                    <h6>Error loading jobs</h6>
                    <p class="small">Please try refreshing the page.</p>
                </div>
            `;
        });
}

// Update UI with jobs data
function updateJobsUI(jobs) {
    const jobsContainer = document.getElementById('jobsContainer');
    
    if (jobs.length > 0) {
        jobsContainer.innerHTML = '';
        
        // Display the 3 most recent jobs
        const recentJobs = jobs.sort((a, b) => {
            return new Date(b.createdAt) - new Date(a.createdAt);
        }).slice(0, 3);
        
        recentJobs.forEach(job => {
            // Format requirements as badges
            let requirementsBadges = '';
            if (job.requirements && job.requirements.length > 0) {
                requirementsBadges = job.requirements.slice(0, 4).map(req => 
                    `<span class="badge bg-light text-dark me-1">${req}</span>`
                ).join('');
                
                if (job.requirements.length > 4) {
                    requirementsBadges += `<span class="badge bg-light text-dark">+${job.requirements.length - 4} more</span>`;
                }
            }
            
            // Format salary
            const salary = job.salary ? job.salary : 'Not disclosed';
            
            // Format date
            const createdDate = job.createdAt ? new Date(job.createdAt.seconds * 1000) : new Date();
            const daysAgo = Math.floor((new Date() - createdDate) / (1000 * 60 * 60 * 24));
            const postedDate = daysAgo === 0 ? 'Today' : daysAgo === 1 ? 'Yesterday' : `${daysAgo} days ago`;
            
            const jobHtml = `
                <div class="job-card card mb-3">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-start">
                            <div>
                                <h5 class="card-title mb-1">${job.title}</h5>
                                <p class="text-muted mb-2">${job.company} ${job.location ? ' - ' + job.location : ''}</p>
                                <div class="mb-2">
                                    ${requirementsBadges}
                                </div>
                                <small class="text-muted">Posted ${postedDate} · ${salary}</small>
                            </div>
                            <button class="btn btn-sm btn-primary apply-job-btn" data-job-id="${job.id}">Apply Now</button>
                        </div>
                    </div>
                </div>
            `;
            
            jobsContainer.innerHTML += jobHtml;
        });
        
        // Add event listeners to apply buttons
        document.querySelectorAll('.apply-job-btn').forEach(button => {
            button.addEventListener('click', function() {
                const jobId = this.getAttribute('data-job-id');
                applyForJob(jobId, this);
            });
        });
        
        // Also update the all jobs container (for the Jobs section)
        const allJobsContainer = document.getElementById('allJobsContainer');
        allJobsContainer.innerHTML = '<div class="text-center py-3 mb-3"><strong>Total Jobs Available: ' + jobs.length + '</strong></div>';
        
        // This would be expanded when building out the full jobs section
    } else {
        jobsContainer.innerHTML = `
            <div class="text-center py-4 text-muted">
                <i class="fas fa-briefcase fa-3x mb-3"></i>
                <h6>No jobs available</h6>
                <p class="small">Check back soon for new opportunities.</p>
            </div>
        `;
    }
}

// Apply for a job
function applyForJob(jobId, buttonElement) {
    // Save original button text and disable button
    const originalText = buttonElement.textContent;
    buttonElement.disabled = true;
    buttonElement.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Applying...';
    
    fetch('/api/candidate/apply', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ jobId: jobId })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            buttonElement.classList.remove('btn-primary');
            buttonElement.classList.add('btn-success');
            buttonElement.innerHTML = '<i class="fas fa-check me-1"></i> Applied';
            buttonElement.disabled = true;
            
            // Reload candidate data to update applications count
            loadCandidateData();
        } else {
            buttonElement.disabled = false;
            buttonElement.textContent = originalText;
            alert(data.message || 'Failed to apply. Please try again.');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        buttonElement.disabled = false;
        buttonElement.textContent = originalText;
        alert('An error occurred. Please try again.');
    });
}