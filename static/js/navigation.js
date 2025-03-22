// navigation-fix.js - Add this at the top of your dashboard.js file or as a separate script

document.addEventListener('DOMContentLoaded', function() {
    console.log('Setting up navigation handlers');
    
    // Set up navigation handlers for all nav links
    document.querySelectorAll('.nav-link, .nav-link-action').forEach(link => {
        link.addEventListener('click', function(e) {
            // Get the target section from the href attribute
            const href = this.getAttribute('href');
            
            // Only handle internal section links (starting with #)
            if (href && href.startsWith('#')) {
                e.preventDefault(); // Prevent default anchor behavior
                
                const targetSectionId = href.substring(1); // Remove the # from the href
                console.log('Navigation: Switching to section:', targetSectionId);
                
                // Call your navigation function
                navigateToSection(targetSectionId);
            }
        });
    });
    
    // Check if URL already has a hash on page load
    if (window.location.hash) {
        const sectionId = window.location.hash.substring(1);
        console.log('Initial navigation from URL hash:', sectionId);
        
        // Small delay to ensure DOM is fully processed
        setTimeout(() => {
            navigateToSection(sectionId);
        }, 100);
    }
    
    // Handle hash changes (back/forward browser navigation)
    window.addEventListener('hashchange', function() {
        const sectionId = window.location.hash.substring(1);
        console.log('Hash changed to:', sectionId);
        navigateToSection(sectionId);
    });
});

// Improved navigation function
function navigateToSection(sectionId) {
    console.log('Navigating to section:', sectionId);
    
    // If no section ID or it doesn't exist, default to dashboard
    if (!sectionId || !document.getElementById(sectionId)) {
        console.warn('Invalid section ID, defaulting to dashboard');
        sectionId = 'dashboard-section';
    }
    
    // Hide all sections
    document.querySelectorAll('section').forEach(section => {
        section.classList.add('d-none');
    });
    
    // Show the selected section
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.remove('d-none');
        
        // Update active state in sidebar
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === '#' + sectionId) {
                link.classList.add('active');
            }
        });
        
        // Update URL hash without triggering another hashchange event
        const currentHash = window.location.hash.substring(1);
        if (currentHash !== sectionId) {
            history.pushState(null, '', '#' + sectionId);
        }
        
        // Load section-specific data if needed
        loadSectionData(sectionId);
    } else {
        console.error('Target section not found:', sectionId);
    }
}

// Load section-specific data
function loadSectionData(sectionId) {
    console.log('Loading data for section:', sectionId);
    
    switch (sectionId) {
        case 'jobs-section':
            if (typeof loadJobsSection === 'function') {
                loadJobsSection();
            } else if (typeof loadJobListings === 'function') {
                loadJobListings();
            } else {
                console.log('Loading jobs from API...');
                fetchJobs().then(jobs => {
                    updateJobsUI(jobs);
                });
            }
            break;
            
        case 'applications-section':
            if (typeof loadApplicationsSection === 'function') {
                loadApplicationsSection();
            } else if (typeof loadApplications === 'function') {
                loadApplications();
            } else {
                console.log('Loading applications from API...');
                fetchApplications().then(applications => {
                    updateApplicationsUI(applications);
                });
            }
            break;
            
        case 'assessments-section':
            if (typeof loadAssessmentsSection === 'function') {
                loadAssessmentsSection();
            } else if (typeof loadAssessments === 'function') {
                loadAssessments();
            }
            break;
            
        case 'profile-section':
            if (typeof loadProfileSection === 'function') {
                loadProfileSection();
            } else if (typeof loadProfileData === 'function') {
                loadProfileData();
            } else {
                console.log('Loading profile from API...');
                fetchProfileData().then(profile => {
                    if (profile) {
                        populateProfileForm(profile);
                    }
                });
            }
            break;
    }
}

// Basic placeholder functions to ensure the script works even if your main script doesn't define them
function updateJobsUI(jobs) {
    if (typeof window.updateJobsUI === 'function') {
        window.updateJobsUI(jobs);
        return;
    }
    
    console.log('Updating jobs UI with', jobs.length, 'jobs');
    const container = document.getElementById('jobListingsContainer');
    if (!container) return;
    
    // Clear loading indicator
    container.innerHTML = '';
    
    if (jobs.length === 0) {
        container.innerHTML = `
            <div class="col-12">
                <div class="alert alert-info">
                    No job listings found at this time.
                </div>
            </div>
        `;
        return;
    }
    
    // Render jobs (simplified for emergency fix)
    jobs.forEach(job => {
        const jobCol = document.createElement('div');
        jobCol.className = 'col-md-6 mb-4';
        
        jobCol.innerHTML = `
            <div class="card h-100">
                <div class="card-body">
                    <h5 class="card-title">${job.title || 'Untitled Position'}</h5>
                    <h6 class="text-muted">${job.company || ''} ${job.location ? ' - ' + job.location : ''}</h6>
                    <p class="card-text">${job.description || ''}</p>
                </div>
                <div class="card-footer">
                    <button class="btn btn-primary" onclick="applyToJob('${job.id}')">Apply Now</button>
                </div>
            </div>
        `;
        
        container.appendChild(jobCol);
    });
}

function updateApplicationsUI(applications) {
    if (typeof window.updateApplicationsUI === 'function') {
        window.updateApplicationsUI(applications);
        return;
    }
    
    console.log('Updating applications UI with', applications.length, 'applications');
    // Update table (minimal implementation for emergency fix)
    const table = document.getElementById('applicationsTable');
    if (!table) return;
    
    // Update count
    const countElement = document.getElementById('applicationsCount');
    if (countElement) countElement.textContent = applications.length;
    
    // Clear table
    table.innerHTML = '';
    
    if (applications.length === 0) {
        table.innerHTML = `<tr><td colspan="5" class="text-center">No applications found</td></tr>`;
        return;
    }
    
    // Add rows
    applications.forEach(app => {
        const row = document.createElement('tr');
        
        // Format date
        let formattedDate = 'N/A';
        try {
            if (app.appliedAt) {
                // Handle Firestore timestamp
                if (app.appliedAt.seconds) {
                    formattedDate = new Date(app.appliedAt.seconds * 1000).toLocaleDateString();
                } else {
                    formattedDate = new Date(app.appliedAt).toLocaleDateString();
                }
            }
        } catch (e) {
            console.warn('Error formatting date:', e);
        }
        
        // Get job info
        const jobTitle = app.job?.title || app.title || 'Unknown Position';
        const company = app.job?.company || app.company || 'Unknown Company';
        
        // Status badge class
        const statusClassMap = {
            'applied': 'bg-secondary',
            'reviewing': 'bg-info',
            'interview': 'bg-primary',
            'offered': 'bg-success',
            'rejected': 'bg-danger'
        };
        
        const statusClass = statusClassMap[app.status] || 'bg-secondary';
        
        row.innerHTML = `
            <td>${jobTitle}</td>
            <td>${company}</td>
            <td>${formattedDate}</td>
            <td><span class="badge ${statusClass}">${app.status}</span></td>
            <td>
                <button class="btn btn-sm btn-outline-primary me-1" onclick="viewApplication('${app.id}')">
                    <i class="fas fa-eye"></i>
                </button>
            </td>
        `;
        
        table.appendChild(row);
    });
    
    // Also update the dashboard table
    updateApplicationStatusTable(applications);
}

function updateApplicationStatusTable(applications) {
    if (typeof window.updateApplicationStatusTable === 'function') {
        window.updateApplicationStatusTable(applications);
        return;
    }
    
    const table = document.getElementById('applicationStatusTable');
    if (!table) return;
    
    table.innerHTML = '';
    
    if (applications.length === 0) {
        table.innerHTML = `<tr><td colspan="4" class="text-center">No applications found</td></tr>`;
        return;
    }
    
    // Show only recent applications (up to 3)
    const recentApps = applications
        .sort((a, b) => {
            // Sort by date (descending)
            const dateA = a.appliedAt?.seconds ? a.appliedAt.seconds : 0;
            const dateB = b.appliedAt?.seconds ? b.appliedAt.seconds : 0;
            return dateB - dateA;
        })
        .slice(0, 3);
    
    recentApps.forEach(app => {
        // Similar logic as updateApplicationsUI but simplified
        // ...
        const row = document.createElement('tr');
        
        // Format date
        let formattedDate = 'N/A';
        try {
            if (app.appliedAt) {
                // Handle Firestore timestamp
                if (app.appliedAt.seconds) {
                    formattedDate = new Date(app.appliedAt.seconds * 1000).toLocaleDateString();
                } else {
                    formattedDate = new Date(app.appliedAt).toLocaleDateString();
                }
            }
        } catch (e) {
            console.warn('Error formatting date:', e);
        }
        
        // Get job info
        const jobTitle = app.job?.title || app.title || 'Unknown Position';
        const company = app.job?.company || app.company || 'Unknown Company';
        
        // Status badge class
        const statusClassMap = {
            'applied': 'bg-secondary',
            'reviewing': 'bg-info',
            'interview': 'bg-primary',
            'offered': 'bg-success',
            'rejected': 'bg-danger'
        };
        
        const statusClass = statusClassMap[app.status] || 'bg-secondary';
        
        row.innerHTML = `
            <td>${jobTitle}</td>
            <td>${company}</td>
            <td><span class="badge ${statusClass}">${app.status}</span></td>
            <td>${formattedDate}</td>
        `;
        
        table.appendChild(row);
    });
}

function populateProfileForm(profile) {
    if (typeof window.populateProfileForm === 'function') {
        window.populateProfileForm(profile);
        return;
    }
    
    console.log('Populating profile form with:', profile);
    
    // Update name display
    const nameElements = document.querySelectorAll('#userName, #sidebarUserName');
    nameElements.forEach(el => {
        if (el) el.textContent = profile.displayName || '';
    });
    
    // Update form fields
    if (profile.firstName) document.getElementById('firstName').value = profile.firstName;
    if (profile.lastName) document.getElementById('lastName').value = profile.lastName;
    if (profile.email) document.getElementById('email').value = profile.email;
    if (profile.phone) document.getElementById('phone').value = profile.phone;
    if (profile.location) document.getElementById('location').value = profile.location;
    if (profile.professionalTitle) document.getElementById('professionalTitle').value = profile.professionalTitle;
    if (profile.summary) document.getElementById('summary').value = profile.summary;
    
    // Update profile images if available
    if (profile.photoURL) {
        const profileImages = document.querySelectorAll('#headerProfileImage, #sidebarProfileImage, #profilePageImage');
        profileImages.forEach(img => {
            if (img) img.src = profile.photoURL;
        });
    }
    
    // Update profile completion
    const completionPercentage = calculateProfileCompletion(profile);
    updateProfileCompletion(completionPercentage);
}

function calculateProfileCompletion(profile) {
    // Simple calculation based on filled fields
    const requiredFields = ['firstName', 'lastName', 'phone', 'location', 'professionalTitle', 'summary'];
    const filledFields = requiredFields.filter(field => profile[field] && profile[field].trim() !== '');
    return Math.round((filledFields.length / requiredFields.length) * 100);
}

function updateProfileCompletion(percentage) {
    if (typeof window.updateProfileCompletion === 'function') {
        window.updateProfileCompletion(percentage);
        return;
    }
    
    const percentageElement = document.getElementById('profileCompletionPercentage');
    const progressBar = document.getElementById('profileCompletionBar');
    
    if (percentageElement && progressBar) {
        percentageElement.textContent = `${percentage}%`;
        progressBar.style.width = `${percentage}%`;
        
        // Update color based on completion
        if (percentage < 30) {
            progressBar.className = 'progress-bar bg-danger';
        } else if (percentage < 70) {
            progressBar.className = 'progress-bar bg-warning';
        } else {
            progressBar.className = 'progress-bar bg-success';
        }
    }
}