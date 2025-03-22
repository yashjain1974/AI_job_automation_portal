// recruiter.js

document.addEventListener('DOMContentLoaded', function() {
    // Initialize the dashboard
    initializeDashboard();
    
    // Load data
    loadDashboardData();
    
    // Set up form submissions
    setupFormSubmissions();
});

// Initialize dashboard components and event listeners
function initializeDashboard() {
    // Check if we're coming back from a logout
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
    const navLinks = document.querySelectorAll('.sidebar .nav-link, .dropdown-item[href^="#"]');
    const sections = document.querySelectorAll('section');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            // Only prevent default if it's a section link
            if (this.getAttribute('href').startsWith('#')) {
                e.preventDefault();
                
                // Remove active class from all nav links
                document.querySelectorAll('.sidebar .nav-link').forEach(navLink => {
                    navLink.classList.remove('active');
                });
                
                // Add active class to corresponding sidebar link
                const targetId = this.getAttribute('href');
                const sidebarLink = document.querySelector(`.sidebar .nav-link[href="${targetId}"]`);
                if (sidebarLink) {
                    sidebarLink.classList.add('active');
                }
                
                // Hide all sections
                sections.forEach(section => section.classList.add('d-none'));
                
                // Show the selected section
                document.querySelector(targetId).classList.remove('d-none');
            }
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
    
    // Post Job button
    document.getElementById('postJobBtn').addEventListener('click', function() {
        // Switch to jobs section
        document.querySelectorAll('.sidebar .nav-link').forEach(navLink => {
            navLink.classList.remove('active');
        });
        
        const jobsLink = document.querySelector('.sidebar .nav-link[href="#jobs-section"]');
        if (jobsLink) {
            jobsLink.classList.add('active');
        }
        
        sections.forEach(section => section.classList.add('d-none'));
        document.querySelector('#jobs-section').classList.remove('d-none');
        
        // Here you would show a modal or form for creating a new job
        alert('Post new job functionality would be implemented here.');
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
            // Set a flag that we logged out intentionally
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

// Load dashboard data from API
function loadDashboardData() {
    // Load profile data
    loadProfileData();
    
    // Load jobs data
    loadJobsData();
    
    // Load applications data
    loadApplicationsData();
    
    // Load assessments data
    loadAssessmentsData();
}

// Load profile data
function loadProfileData() {
    // This would be a call to your backend API
    // For demo purposes, we'll use placeholder data
    
    // Simulate API call delay
    setTimeout(() => {
        const profileData = {
            name: document.getElementById('profileName').textContent,
            title: 'Senior Recruiter',
            email: document.getElementById('profileEmail').textContent,
            phone: '+916377734561',
            location: 'Delhi , India',
            company: 'Jaypee Inc.',
            jobsCount: 5,
            hiresCount: 12,
            assessmentsCount: 8
        };
        
        updateProfileUI(profileData);
    }, 1000);
}

// Update UI with profile data
function updateProfileUI(profile) {
    // Update profile form fields
    document.getElementById('fullName').value = profile.name;
    document.getElementById('jobTitle').value = profile.title;
    document.getElementById('email').value = profile.email;
    document.getElementById('phone').value = profile.phone;
    document.getElementById('company').value = profile.company;
    document.getElementById('location').value = profile.location;
    
    // Update profile display
    document.getElementById('profileTitle').textContent = profile.title + ' at ' + profile.company;
    document.getElementById('profilePhone').textContent = profile.phone;
    document.getElementById('profileLocation').textContent = profile.location;
    
    // Update profile stats
    document.getElementById('profileJobsCount').textContent = profile.jobsCount;
    document.getElementById('profileHiresCount').textContent = profile.hiresCount;
    document.getElementById('profileAssessmentsCount').textContent = profile.assessmentsCount;
}

// Load jobs data
function loadJobsData() {
    const loadingElement = document.getElementById('loadingJobs');
    const noJobsMessage = document.getElementById('noJobsMessage');
    
    if (loadingElement) {
        loadingElement.style.display = 'block';
    }
    
    // This would be a call to your backend API
    // For demo purposes, we'll use placeholder data
    
    // Simulate API call delay
    setTimeout(() => {
        const jobsData = [
            {
                id: 'job1',
                title: 'Senior Software Engineer',
                company: 'Tech Innovations Inc.',
                location: 'New York, NY',
                applications: 12,
                status: 'active',
                postedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
            },
            {
                id: 'job2',
                title: 'Product Manager',
                company: 'Tech Innovations Inc.',
                location: 'Remote',
                applications: 8,
                status: 'active',
                postedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
            },
            {
                id: 'job3',
                title: 'UX Designer',
                company: 'Tech Innovations Inc.',
                location: 'Boston, MA',
                applications: 5,
                status: 'active',
                postedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
            }
        ];
        
        if (loadingElement) {
            loadingElement.style.display = 'none';
        }
        
        // Update jobs count
        document.getElementById('activeJobsCount').textContent = jobsData.length;
        
        // Update jobs listing
        updateJobsUI(jobsData);
        
        // Update job filter dropdown
        updateJobFilterOptions(jobsData);
    }, 1500);
}

// Update UI with jobs data
function updateJobsUI(jobs) {
    const recentJobsContainer = document.getElementById('recentJobsContainer');
    const noJobsMessage = document.getElementById('noJobsMessage');
    
    if (jobs.length > 0) {
        if (noJobsMessage) {
            noJobsMessage.classList.add('d-none');
        }
        
        // Create HTML for jobs
        let jobsHTML = '';
        
        jobs.forEach(job => {
            // Format date
            const postedDate = job.postedAt;
            const daysAgo = Math.floor((new Date() - postedDate) / (1000 * 60 * 60 * 24));
            const postedText = daysAgo === 0 ? 'Today' : daysAgo === 1 ? 'Yesterday' : `${daysAgo} days ago`;
            
            jobsHTML += `
                <div class="job-card card">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-start">
                            <div>
                                <h5 class="mb-1">${job.title}</h5>
                                <p class="text-muted mb-2">${job.location}</p>
                                <small class="text-muted">Posted ${postedText} • ${job.applications} applications</small>
                            </div>
                            <div class="btn-group">
                                <button class="btn btn-sm btn-outline-primary view-job-btn" data-job-id="${job.id}">View</button>
                                <button class="btn btn-sm btn-outline-secondary edit-job-btn" data-job-id="${job.id}">Edit</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        });
        
        recentJobsContainer.innerHTML = jobsHTML;
        
        // Add event listeners to job buttons
        document.querySelectorAll('.view-job-btn').forEach(button => {
            button.addEventListener('click', function() {
                const jobId = this.getAttribute('data-job-id');
                alert(`View job ${jobId}`);
            });
        });
        
        document.querySelectorAll('.edit-job-btn').forEach(button => {
            button.addEventListener('click', function() {
                const jobId = this.getAttribute('data-job-id');
                alert(`Edit job ${jobId}`);
            });
        });
    } else {
        if (noJobsMessage) {
            noJobsMessage.classList.remove('d-none');
        }
    }
}

// Update job filter dropdown options
function updateJobFilterOptions(jobs) {
    const jobFilter = document.getElementById('jobFilter');
    const assessmentJob = document.getElementById('assessmentJob');
    
    if (jobFilter) {
        let optionsHTML = '<option value="">All Jobs</option>';
        
        jobs.forEach(job => {
            optionsHTML += `<option value="${job.id}">${job.title}</option>`;
        });
        
        jobFilter.innerHTML = optionsHTML;
    }
    
    if (assessmentJob) {
        let optionsHTML = '<option value="">Select Job</option>';
        
        jobs.forEach(job => {
            optionsHTML += `<option value="${job.id}">${job.title}</option>`;
        });
        
        assessmentJob.innerHTML = optionsHTML;
    }
}

// Load applications data
function loadApplicationsData() {
    const loadingElement = document.getElementById('loadingApplications');
    const noApplicationsMessage = document.getElementById('noApplicationsMessage');
    
    if (loadingElement) {
        loadingElement.style.display = 'block';
    }
    
    // This would be a call to your backend API
    // For demo purposes, we'll use placeholder data
    
    // Simulate API call delay
    setTimeout(() => {
        const applicationsData = [
            {
                id: 'app1',
                candidateName: 'John Smith',
                candidateEmail: 'john.smith@example.com',
                jobTitle: 'Senior Software Engineer',
                status: 'applied',
                appliedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
            },
            {
                id: 'app2',
                candidateName: 'Sarah Johnson',
                candidateEmail: 'sarah.johnson@example.com',
                jobTitle: 'Product Manager',
                status: 'reviewing',
                appliedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
            },
            {
                id: 'app3',
                candidateName: 'Michael Brown',
                candidateEmail: 'michael.brown@example.com',
                jobTitle: 'UX Designer',
                status: 'interview',
                appliedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
            },
            {
                id: 'app4',
                candidateName: 'Emily Davis',
                candidateEmail: 'emily.davis@example.com',
                jobTitle: 'Senior Software Engineer',
                status: 'offered',
                appliedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
            }
        ];
        
        if (loadingElement) {
            loadingElement.style.display = 'none';
        }
        
        // Count applications by status
        const newApplications = applicationsData.filter(app => app.status === 'applied').length;
        document.getElementById('newApplicationsCount').textContent = newApplications;
        
        const interviewApplications = applicationsData.filter(app => app.status === 'interview').length;
        document.getElementById('interviewsCount').textContent = interviewApplications;
        
        const hiredApplications = applicationsData.filter(app => app.status === 'hired').length;
        document.getElementById('hiredCount').textContent = hiredApplications;
        
        // Update applications listing
        updateApplicationsUI(applicationsData);
    }, 1800);
}

// Update UI with applications data
function updateApplicationsUI(applications) {
    const recentApplicationsContainer = document.getElementById('recentApplicationsContainer');
    const noApplicationsMessage = document.getElementById('noApplicationsMessage');
    const loadingInterviews = document.getElementById('loadingInterviews');
    const noInterviewsMessage = document.getElementById('noInterviewsMessage');
    
    if (applications.length > 0) {
        if (noApplicationsMessage) {
            noApplicationsMessage.classList.add('d-none');
        }
        
        // Create HTML for applications
        let applicationsHTML = '';
        
        applications.forEach(application => {
            // Format date
            const appliedDate = application.appliedAt;
            const daysAgo = Math.floor((new Date() - appliedDate) / (1000 * 60 * 60 * 24));
            const appliedText = daysAgo === 0 ? 'Today' : daysAgo === 1 ? 'Yesterday' : `${daysAgo} days ago`;
            
            // Status badge
            const statusMap = {
                'applied': 'Applied',
                'reviewing': 'Reviewing',
                'interview': 'Interview',
                'offered': 'Offered',
                'hired': 'Hired',
                'rejected': 'Rejected'
            };
            
            const badgeClass = `badge-${application.status}`;
            const statusText = statusMap[application.status] || 'Applied';
            
            applicationsHTML += `
                <div class="application-card card">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-start">
                            <div>
                                <h5 class="mb-1">${application.candidateName}</h5>
                                <p class="text-muted mb-2">${application.jobTitle}</p>
                                <span class="badge ${badgeClass}">${statusText}</span>
                                <small class="text-muted ms-2">Applied ${appliedText}</small>
                            </div>
                            <div class="btn-group">
                                <button class="btn btn-sm btn-outline-primary view-application-btn" data-application-id="${application.id}">View</button>
                                <button class="btn btn-sm btn-outline-secondary update-status-btn" data-application-id="${application.id}">Update</button>
                        </div>
                    </td>
                </tr>
            `;
        });
        
        tableHTML += `
                </tbody>
            </table>
        `;
        
        applicationsContainer.innerHTML = tableHTML;
        
        // Add event listeners to application buttons
        document.querySelectorAll('.view-application-btn').forEach(button => {
            button.addEventListener('click', function() {
                const applicationId = this.getAttribute('data-application-id');
                alert(`View application ${applicationId}`);
            });
        });
        
        document.querySelectorAll('.update-status-btn').forEach(button => {
            button.addEventListener('click', function() {
                const applicationId = this.getAttribute('data-application-id');
                alert(`Update status for application ${applicationId}`);
            });
        });
    }
}

// Load assessments data
function loadAssessmentsData() {
    const loadingAssessments = document.getElementById('loadingAssessments');
    const assessmentsTableContainer = document.getElementById('assessmentsTableContainer');
    const noAssessmentsMessage = document.getElementById('noAssessmentsMessage');
    
    if (loadingAssessments) {
        loadingAssessments.style.display = 'block';
    }
    
    // This would be a call to your backend API
    // For demo purposes, we'll use placeholder data
    
    // Simulate API call delay
    setTimeout(() => {
        const assessmentsData = [
            {
                id: 'assess1',
                title: 'Technical Assessment - Backend',
                type: 'technical',
                job: 'Senior Software Engineer',
                duration: 60,
                candidates: 8
            },
            {
                id: 'assess2',
                title: 'Product Knowledge Test',
                type: 'aptitude',
                job: 'Product Manager',
                duration: 45,
                candidates: 5
            },
            {
                id: 'assess3',
                title: 'UI/UX Design Challenge',
                type: 'coding',
                job: 'UX Designer',
                duration: 90,
                candidates: 3
            }
        ];
        
        if (loadingAssessments) {
            loadingAssessments.style.display = 'none';
        }
        
        // Update assessments UI
        updateAssessmentsUI(assessmentsData);
        
        // Load assessment results
        loadAssessmentResults();
    }, 2000);
}

// Update UI with assessments data
function updateAssessmentsUI(assessments) {
    const assessmentsTableContainer = document.getElementById('assessmentsTableContainer');
    const noAssessmentsMessage = document.getElementById('noAssessmentsMessage');
    const assessmentsTableBody = document.getElementById('assessmentsTableBody');
    
    if (assessments.length > 0) {
        if (noAssessmentsMessage) {
            noAssessmentsMessage.classList.add('d-none');
        }
        
        if (assessmentsTableContainer) {
            assessmentsTableContainer.classList.remove('d-none');
        }
        
        // Create table rows for assessments
        let tableRows = '';
        
        assessments.forEach(assessment => {
            // Format assessment type
            const typeMap = {
                'technical': 'Technical Test',
                'personality': 'Personality Assessment',
                'aptitude': 'Aptitude Test',
                'coding': 'Coding Challenge'
            };
            
            const typeText = typeMap[assessment.type] || assessment.type;
            
            tableRows += `
                <tr>
                    <td>${assessment.title}</td>
                    <td>${typeText}</td>
                    <td>${assessment.job}</td>
                    <td>${assessment.duration} min</td>
                    <td>${assessment.candidates}</td>
                    <td>
                        <div class="btn-group">
                            <button class="btn btn-sm btn-outline-primary view-assessment-btn" data-assessment-id="${assessment.id}">View</button>
                            <button class="btn btn-sm btn-outline-secondary edit-assessment-btn" data-assessment-id="${assessment.id}">Edit</button>
                            <button class="btn btn-sm btn-outline-danger delete-assessment-btn" data-assessment-id="${assessment.id}">Delete</button>
                        </div>
                    </td>
                </tr>
            `;
        });
        
        if (assessmentsTableBody) {
            assessmentsTableBody.innerHTML = tableRows;
        }
        
        // Add event listeners to assessment buttons
        document.querySelectorAll('.view-assessment-btn').forEach(button => {
            button.addEventListener('click', function() {
                const assessmentId = this.getAttribute('data-assessment-id');
                alert(`View assessment ${assessmentId}`);
            });
        });
        
        document.querySelectorAll('.edit-assessment-btn').forEach(button => {
            button.addEventListener('click', function() {
                const assessmentId = this.getAttribute('data-assessment-id');
                alert(`Edit assessment ${assessmentId}`);
            });
        });
        
        document.querySelectorAll('.delete-assessment-btn').forEach(button => {
            button.addEventListener('click', function() {
                const assessmentId = this.getAttribute('data-assessment-id');
                if (confirm('Are you sure you want to delete this assessment?')) {
                    alert(`Delete assessment ${assessmentId}`);
                }
            });
        });
    } else {
        if (assessmentsTableContainer) {
            assessmentsTableContainer.classList.add('d-none');
        }
        
        if (noAssessmentsMessage) {
            noAssessmentsMessage.classList.remove('d-none');
        }
    }
}

// Load assessment results
function loadAssessmentResults() {
    const loadingResults = document.getElementById('loadingResults');
    const resultsTableContainer = document.getElementById('resultsTableContainer');
    const noResultsMessage = document.getElementById('noResultsMessage');
    
    if (loadingResults) {
        loadingResults.style.display = 'block';
    }
    
    // This would be a call to your backend API
    // For demo purposes, we'll use placeholder data
    
    // Simulate API call delay
    setTimeout(() => {
        const resultsData = [
            {
                id: 'result1',
                candidate: 'John Smith',
                assessment: 'Technical Assessment - Backend',
                job: 'Senior Software Engineer',
                score: 85,
                status: 'passed',
                date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
            },
            {
                id: 'result2',
                candidate: 'Sarah Johnson',
                assessment: 'Product Knowledge Test',
                job: 'Product Manager',
                score: 92,
                status: 'passed',
                date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
            },
            {
                id: 'result3',
                candidate: 'Michael Brown',
                assessment: 'UI/UX Design Challenge',
                job: 'UX Designer',
                score: 78,
                status: 'reviewing',
                date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
            }
        ];
        
        if (loadingResults) {
            loadingResults.style.display = 'none';
        }
        
        // Update results UI
        updateResultsUI(resultsData);
    }, 2500);
}

// Update UI with assessment results
function updateResultsUI(results) {
    const resultsTableContainer = document.getElementById('resultsTableContainer');
    const noResultsMessage = document.getElementById('noResultsMessage');
    const resultsTableBody = document.getElementById('resultsTableBody');
    
    if (results.length > 0) {
        if (noResultsMessage) {
            noResultsMessage.classList.add('d-none');
        }
        
        if (resultsTableContainer) {
            resultsTableContainer.classList.remove('d-none');
        }
        
        // Create table rows for results
        let tableRows = '';
        
        results.forEach(result => {
            // Format date
            const resultDate = result.date.toLocaleDateString();
            
            // Format status badge
            const statusClass = result.status === 'passed' ? 'bg-success' : 
                               result.status === 'failed' ? 'bg-danger' : 'bg-warning text-dark';
            const statusText = result.status.charAt(0).toUpperCase() + result.status.slice(1);
            
            tableRows += `
                <tr>
                    <td>${result.candidate}</td>
                    <td>${result.assessment}</td>
                    <td>${result.job}</td>
                    <td><strong>${result.score}%</strong></td>
                    <td><span class="badge ${statusClass}">${statusText}</span></td>
                    <td>${resultDate}</td>
                    <td>
                        <div class="btn-group">
                            <button class="btn btn-sm btn-outline-primary view-result-btn" data-result-id="${result.id}">View</button>
                            <button class="btn btn-sm btn-outline-secondary send-feedback-btn" data-result-id="${result.id}">Feedback</button>
                        </div>
                    </td>
                </tr>
            `;
        });
        
        if (resultsTableBody) {
            resultsTableBody.innerHTML = tableRows;
        }
        
        // Add event listeners to result buttons
        document.querySelectorAll('.view-result-btn').forEach(button => {
            button.addEventListener('click', function() {
                const resultId = this.getAttribute('data-result-id');
                alert(`View result ${resultId}`);
            });
        });
        
        document.querySelectorAll('.send-feedback-btn').forEach(button => {
            button.addEventListener('click', function() {
                const resultId = this.getAttribute('data-result-id');
                alert(`Send feedback for result ${resultId}`);
            });
        });
    } else {
        if (resultsTableContainer) {
            resultsTableContainer.classList.add('d-none');
        }
        
        if (noResultsMessage) {
            noResultsMessage.classList.remove('d-none');
        }
    }
}

// Set up form submissions
function setupFormSubmissions() {
    // Profile form
    const profileForm = document.getElementById('profileForm');
    if (profileForm) {
        profileForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // This would be a call to your backend API
            // For demo purposes, we'll just show an alert
            alert('Profile updated successfully!');
            
            // Update profile display with form values
            document.getElementById('profileName').textContent = document.getElementById('fullName').value;
            document.getElementById('profileTitle').textContent = document.getElementById('jobTitle').value + ' at ' + document.getElementById('company').value;
            document.getElementById('profilePhone').textContent = document.getElementById('phone').value;
            document.getElementById('profileLocation').textContent = document.getElementById('location').value;
            
            // Update sidebar user name
            document.getElementById('sidebarUserName').textContent = document.getElementById('fullName').value;
            document.getElementById('userName').textContent = document.getElementById('fullName').value;
        });
    }
    
    // Password form
    const passwordForm = document.getElementById('passwordForm');
    if (passwordForm) {
        passwordForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const currentPassword = document.getElementById('currentPassword').value;
            const newPassword = document.getElementById('newPassword').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            
            if (!currentPassword || !newPassword || !confirmPassword) {
                alert('Please fill in all password fields.');
                return;
            }
            
            if (newPassword !== confirmPassword) {
                alert('New password and confirm password do not match.');
                return;
            }
            
            // This would be a call to your backend API
            // For demo purposes, we'll just show an alert
            alert('Password updated successfully!');
            
            // Clear password fields
            document.getElementById('currentPassword').value = '';
            document.getElementById('newPassword').value = '';
            document.getElementById('confirmPassword').value = '';
        });
    }
    
    // Save notification preferences
    const saveNotifSettings = document.getElementById('saveNotifSettings');
    if (saveNotifSettings) {
        saveNotifSettings.addEventListener('click', function() {
            // This would be a call to your backend API
            // For demo purposes, we'll just show an alert
            alert('Notification preferences saved!');
        });
    }
    
    // Create assessment form
    const createAssessmentForm = document.getElementById('createAssessmentForm');
    if (createAssessmentForm) {
        createAssessmentForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // This would be a call to your backend API
            // For demo purposes, we'll just show an alert
            alert('Assessment created successfully!');
            
            // Clear form fields
            document.getElementById('assessmentTitle').value = '';
            document.getElementById('assessmentType').value = '';
            document.getElementById('assessmentJob').value = '';
            document.getElementById('assessmentDuration').value = '';
            
            // Reload assessments data
            loadAssessmentsData();
        });
    }
    
    // Profile image upload
    const profileImageUpload = document.getElementById('profileImageUpload');
    if (profileImageUpload) {
        profileImageUpload.addEventListener('change', function(e) {
            const file = e.target.files[0];
            
            if (file) {
                // This would be a call to your backend API to upload the image
                // For demo purposes, we'll just show the file name
                alert('File selected: ' + file.name);
                
                // Create a preview URL (would normally upload to server)
                const reader = new FileReader();
                reader.onload = function(e) {
                    // Update profile images with the new image
                    document.querySelectorAll('.profile-image, .avatar-sm').forEach(img => {
                        img.src = e.target.result;
                    });
                };
                reader.readAsDataURL(file);
            }
        });
    }
}