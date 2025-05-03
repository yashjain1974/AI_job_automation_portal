// This is a corrected version focusing on key fixes while preserving your implementation

document.addEventListener('DOMContentLoaded', function() {
    // Navigation
    const navItems = document.querySelectorAll('.nav-item');
    const formSections = document.querySelectorAll('.form-section');
    
    navItems.forEach(item => {
        item.addEventListener('click', function() {
            const targetSection = this.getAttribute('data-section');
            
            // Update active nav item
            navItems.forEach(nav => nav.classList.remove('active'));
            this.classList.add('active');
            
            // Show target section
            formSections.forEach(section => {
                section.classList.remove('active');
                if (section.id === targetSection) {
                    section.classList.add('active');
                }
            });
        });
    });

    // Next/Previous Navigation
    const nextButtons = document.querySelectorAll('.btn.next');
    const prevButtons = document.querySelectorAll('.btn.prev');
    
    nextButtons.forEach(button => {
        button.addEventListener('click', function() {
            const nextSection = this.getAttribute('data-next');
            
            // Update active nav item
            navItems.forEach(nav => {
                nav.classList.remove('active');
                if (nav.getAttribute('data-section') === nextSection) {
                    nav.classList.add('active');
                }
            });
            
            // Show next section
            formSections.forEach(section => {
                section.classList.remove('active');
                if (section.id === nextSection) {
                    section.classList.add('active');
                }
            });
        });
    });
    
    prevButtons.forEach(button => {
        button.addEventListener('click', function() {
            const prevSection = this.getAttribute('data-prev');
            
            // Update active nav item
            navItems.forEach(nav => {
                nav.classList.remove('active');
                if (nav.getAttribute('data-section') === prevSection) {
                    nav.classList.add('active');
                }
            });
            
            // Show previous section
            formSections.forEach(section => {
                section.classList.remove('active');
                if (section.id === prevSection) {
                    section.classList.add('active');
                }
            });
        });
    });

    // Add More Entry Functions
    let educationCount = 1;
    let experienceCount = 1;
    let projectCount = 1;

    // Add Education Entry
    document.getElementById('add-education').addEventListener('click', function() {
        const educationEntries = document.getElementById('education-entries');
        const newEntry = document.querySelector('.education-entry').cloneNode(true);
        
        // Update IDs and names
        newEntry.setAttribute('data-index', educationCount);
        updateElementAttributes(newEntry, 'education', educationCount);
        
        // Clear input values
        clearInputValues(newEntry);
        
        // Show remove button for all entries except the first one
        document.querySelectorAll('.education-entry .remove-btn').forEach(btn => {
            btn.style.display = 'inline-flex';
        });
        
        // Append new entry
        educationEntries.appendChild(newEntry);
        educationCount++;
        
        // Add event listener to the new remove button
        addRemoveEventListener(newEntry.querySelector('.remove-btn'));
    });

    // Add Experience Entry
    document.getElementById('add-experience').addEventListener('click', function() {
        const experienceEntries = document.getElementById('experience-entries');
        const newEntry = document.querySelector('.experience-entry').cloneNode(true);
        
        // Update IDs and names
        newEntry.setAttribute('data-index', experienceCount);
        updateElementAttributes(newEntry, 'experience', experienceCount);
        
        // Clear input values
        clearInputValues(newEntry);
        
        // Show remove button for all entries except the first one
        document.querySelectorAll('.experience-entry .remove-btn').forEach(btn => {
            btn.style.display = 'inline-flex';
        });
        
        // Append new entry
        experienceEntries.appendChild(newEntry);
        experienceCount++;
        
        // Add event listener to the new remove button
        addRemoveEventListener(newEntry.querySelector('.remove-btn'));
    });

    // Add Project Entry
    document.getElementById('add-project').addEventListener('click', function() {
        const projectEntries = document.getElementById('project-entries');
        const newEntry = document.querySelector('.project-entry').cloneNode(true);
        
        // Update IDs and names
        newEntry.setAttribute('data-index', projectCount);
        updateElementAttributes(newEntry, 'project', projectCount);
        
        // Clear input values
        clearInputValues(newEntry);
        
        // Show remove button for all entries except the first one
        document.querySelectorAll('.project-entry .remove-btn').forEach(btn => {
            btn.style.display = 'inline-flex';
        });
        
        // Append new entry
        projectEntries.appendChild(newEntry);
        projectCount++;
        
        // Add event listener to the new remove button
        addRemoveEventListener(newEntry.querySelector('.remove-btn'));
    });

    // Helper function to update IDs and names of cloned elements
    function updateElementAttributes(entry, type, index) {
        const inputs = entry.querySelectorAll('input, textarea');
        const labels = entry.querySelectorAll('label');
        const removeBtn = entry.querySelector('.remove-btn');
        
        inputs.forEach(input => {
            const oldId = input.id;
            const newId = oldId.replace(/-\d+$/, `-${index}`);
            input.id = newId;
            
            const oldName = input.name;
            let newName;
            
            if (type === 'education') {
                newName = oldName.replace(/education\[\d+\]/, `education[${index}]`);
            } else if (type === 'experience') {
                newName = oldName.replace(/experience\[\d+\]/, `experience[${index}]`);
            } else if (type === 'project') {
                newName = oldName.replace(/projects\[\d+\]/, `projects[${index}]`);
            }
            
            input.name = newName;
        });
        
        labels.forEach(label => {
            const oldFor = label.getAttribute('for');
            const newFor = oldFor.replace(/-\d+$/, `-${index}`);
            label.setAttribute('for', newFor);
        });
        
        if (removeBtn) {
            removeBtn.setAttribute('data-index', index);
        }
    }

    // Helper function to clear input values
    function clearInputValues(entry) {
        const inputs = entry.querySelectorAll('input, textarea');
        inputs.forEach(input => {
            input.value = '';
        });
    }

    // Helper function to add remove event listener
    function addRemoveEventListener(button) {
        button.addEventListener('click', function() {
            const type = this.getAttribute('data-type');
            const index = this.getAttribute('data-index');
            const entry = document.querySelector(`.${type}-entry[data-index="${index}"]`);
            
            entry.remove();
            
            // If there's only one entry left, hide its remove button
            const entries = document.querySelectorAll(`.${type}-entry`);
            if (entries.length === 1) {
                entries[0].querySelector('.remove-btn').style.display = 'none';
            }
        });
    }

    // Add event listeners to the initial remove buttons
    document.querySelectorAll('.remove-btn').forEach(button => {
        addRemoveEventListener(button);
    });

    // Preview Modal
    const previewBtn = document.getElementById('preview-btn');
    const previewModal = document.getElementById('preview-modal');
    const closeBtn = document.querySelector('.close');
    
    previewBtn.addEventListener('click', function() {
        generateResumePreview();
        previewModal.style.display = 'block';
    });
    
    closeBtn.addEventListener('click', function() {
        previewModal.style.display = 'none';
    });
    
    window.addEventListener('click', function(event) {
        if (event.target === previewModal) {
            previewModal.style.display = 'none';
        }
    });

    // Generate Resume Preview
    function generateResumePreview() {
        const previewContainer = document.getElementById('resume-preview');
        const formData = getFormData();
        
        let html = `
            <div class="resume-header">
                <h1>${formData.personal.fullname || 'Full Name'}</h1>
                <div class="resume-contact">
                    ${formData.personal.phone ? `${formData.personal.phone} | ` : ''}
                    ${formData.personal.email ? `${formData.personal.email} | ` : ''}
                    ${formData.personal.linkedin ? `${formData.personal.linkedin} | ` : ''}
                    ${formData.personal.github ? formData.personal.github : ''}
                </div>
            </div>
        `;
        
        // Education Section
        if (formData.education.length > 0) {
            html += `<div class="resume-section">
                <h2>Education</h2>`;
                
            formData.education.forEach(edu => {
                html += `
                    <div class="resume-entry">
                        <div class="resume-entry-header">
                            <span class="resume-entry-title">${edu.institution || ''}</span>
                            <span class="resume-entry-date">${edu.startDate || ''} – ${edu.endDate || ''}</span>
                        </div>
                        <div class="resume-entry-subtitle">
                            <span class="resume-entry-org">${edu.degree || ''}</span>
                            <span class="resume-entry-location">${edu.location || ''}</span>
                        </div>
                    </div>
                `;
            });
            
            html += `</div>`;
        }
        
        // Experience Section
        if (formData.experience.length > 0) {
            html += `<div class="resume-section">
                <h2>Experience</h2>`;
                
            formData.experience.forEach(exp => {
                html += `
                    <div class="resume-entry">
                        <div class="resume-entry-header">
                            <span class="resume-entry-title">${exp.title || ''}</span>
                            <span class="resume-entry-date">${exp.startDate || ''} – ${exp.endDate || ''}</span>
                        </div>
                        <div class="resume-entry-subtitle">
                            <span class="resume-entry-org">${exp.company || ''}</span>
                            <span class="resume-entry-location">${exp.location || ''}</span>
                        </div>
                        <div class="resume-entry-description">
                            <ul>
                                ${formatBulletPoints(exp.responsibilities)}
                            </ul>
                        </div>
                    </div>
                `;
            });
            
            html += `</div>`;
        }
        
        // Projects Section
        if (formData.projects.length > 0) {
            html += `<div class="resume-section">
                <h2>Projects</h2>`;
                
            formData.projects.forEach(proj => {
                html += `
                    <div class="resume-entry">
                        <div class="resume-entry-header">
                            <span class="resume-entry-title">${proj.name || ''} ${proj.technologies ? `| ${proj.technologies}` : ''}</span>
                            <span class="resume-entry-date">${proj.startDate || ''} – ${proj.endDate || ''}</span>
                        </div>
                        <div class="resume-entry-description">
                            <ul>
                                ${formatBulletPoints(proj.description)}
                            </ul>
                        </div>
                    </div>
                `;
            });
            
            html += `</div>`;
        }
        
        // Skills Section
        html += `<div class="resume-section">
            <h2>Technical Skills</h2>
            <div class="resume-skills">`;
            
        if (formData.skills.languages) {
            html += `
                <div class="resume-skill-category">
                    <h3>Languages:</h3>
                    <p>${formData.skills.languages}</p>
                </div>
            `;
        }
        
        if (formData.skills.frameworks) {
            html += `
                <div class="resume-skill-category">
                    <h3>Frameworks:</h3>
                    <p>${formData.skills.frameworks}</p>
                </div>
            `;
        }
        
        if (formData.skills.tools) {
            html += `
                <div class="resume-skill-category">
                    <h3>Developer Tools:</h3>
                    <p>${formData.skills.tools}</p>
                </div>
            `;
        }
        
        if (formData.skills.libraries) {
            html += `
                <div class="resume-skill-category">
                    <h3>Libraries:</h3>
                    <p>${formData.skills.libraries}</p>
                </div>
            `;
        }
            
        html += `</div></div>`;
        
        previewContainer.innerHTML = html;
    }

    // Helper function to format bullet points for responsibilities and descriptions
    function formatBulletPoints(text) {
        if (!text) return '';
        
        // Split by new line and convert to bullet points
        return text.split('\n')
            .filter(line => line.trim() !== '')
            .map(line => `<li>${line.trim().startsWith('•') ? line.trim().substring(1).trim() : line.trim()}</li>`)
            .join('');
    }

    // Get form data
    function getFormData() {
        const formData = {
            personal: {
                fullname: document.getElementById('fullname').value,
                phone: document.getElementById('phone').value,
                email: document.getElementById('email').value,
                linkedin: document.getElementById('linkedin').value,
                github: document.getElementById('github').value
            },
            education: [],
            experience: [],
            projects: [],
            skills: {
                languages: document.getElementById('skill-languages').value,
                frameworks: document.getElementById('skill-frameworks').value,
                tools: document.getElementById('skill-tools').value,
                libraries: document.getElementById('skill-libraries').value
            }
        };
        
        // Get education entries
        document.querySelectorAll('.education-entry').forEach(entry => {
            const index = entry.getAttribute('data-index');
            formData.education.push({
                institution: document.getElementById(`edu-institution-${index}`).value,
                location: document.getElementById(`edu-location-${index}`).value,
                degree: document.getElementById(`edu-degree-${index}`).value,
                startDate: document.getElementById(`edu-start-${index}`).value,
                endDate: document.getElementById(`edu-end-${index}`).value
            });
        });
        
        // Get experience entries
        document.querySelectorAll('.experience-entry').forEach(entry => {
            const index = entry.getAttribute('data-index');
            formData.experience.push({
                title: document.getElementById(`exp-title-${index}`).value,
                company: document.getElementById(`exp-company-${index}`).value,
                location: document.getElementById(`exp-location-${index}`).value,
                startDate: document.getElementById(`exp-start-${index}`).value,
                endDate: document.getElementById(`exp-end-${index}`).value,
                responsibilities: document.getElementById(`exp-responsibilities-${index}`).value
            });
        });
        
        // Get project entries
        document.querySelectorAll('.project-entry').forEach(entry => {
            const index = entry.getAttribute('data-index');
            formData.projects.push({
                name: document.getElementById(`proj-name-${index}`).value,
                technologies: document.getElementById(`proj-tech-${index}`).value,
                startDate: document.getElementById(`proj-start-${index}`).value,
                endDate: document.getElementById(`proj-end-${index}`).value,
                description: document.getElementById(`proj-description-${index}`).value
            });
        });
        
        return formData;
    }

    const modalPrintBtn = document.getElementById('modal-print-btn');
if (modalPrintBtn) {
    modalPrintBtn.addEventListener('click', function() {
        // Create a printable version in a new window
        const printWindow = window.open('', '_blank');
        
        // Get the resume content
        const resumeContent = document.getElementById('resume-preview').innerHTML;
        
        // Create the print document with proper styling
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Resume - ${document.getElementById('fullname').value || 'Print'}</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        line-height: 1.5;
                        color: #333;
                        max-width: 800px;
                        margin: 0 auto;
                        padding: 20px;
                    }
                    .resume-header {
                        text-align: center;
                        margin-bottom: 20px;
                    }
                    .resume-header h1 {
                        margin-bottom: 5px;
                    }
                    .resume-contact {
                        font-size: 14px;
                        color: #555;
                    }
                    .resume-section {
                        margin-bottom: 20px;
                    }
                    .resume-section h2 {
                        color: #3498db;
                        text-transform: uppercase;
                        border-bottom: 1px solid #ddd;
                        padding-bottom: 5px;
                        margin-bottom: 15px;
                    }
                    .resume-entry {
                        margin-bottom: 15px;
                    }
                    .resume-entry-header {
                        display: flex;
                        justify-content: space-between;
                        margin-bottom: 5px;
                    }
                    .resume-entry-title {
                        font-weight: bold;
                    }
                    .resume-entry-date {
                        color: #555;
                        font-style: italic;
                    }
                    .resume-entry-subtitle {
                        display: flex;
                        justify-content: space-between;
                        margin-bottom: 10px;
                    }
                    .resume-entry-org {
                        font-style: italic;
                    }
                    .resume-entry-location {
                        color: #555;
                    }
                    .resume-entry-description ul {
                        margin-top: 5px;
                        margin-bottom: 0;
                    }
                    .resume-skills {
                        display: grid;
                        grid-template-columns: repeat(2, 1fr);
                        gap: 20px;
                    }
                    .resume-skill-category h3 {
                        margin-bottom: 5px;
                    }
                    .resume-skill-category p {
                        margin: 0;
                    }
                    
                    @media print {
                        body {
                            padding: 0;
                        }
                        .resume-section h2 {
                            color: #000;
                        }
                    }
                </style>
            </head>
            <body>
                ${resumeContent}
                <script>
                    // Automatically print when loaded
                    window.onload = function() {
                        window.print();
                    }
                </script>
            </body>
            </html>
        `);
        
        printWindow.document.close();
    });
}

const modalDownloadBtn = document.getElementById('modal-download-btn');
if (modalDownloadBtn) {
    modalDownloadBtn.addEventListener('click', function() {
        // Show loading indicator
        const loadingIndicator = document.createElement('div');
        loadingIndicator.textContent = 'Preparing download...';
        loadingIndicator.style.position = 'fixed';
        loadingIndicator.style.top = '50%';
        loadingIndicator.style.left = '50%';
        loadingIndicator.style.transform = 'translate(-50%, -50%)';
        loadingIndicator.style.padding = '20px';
        loadingIndicator.style.backgroundColor = 'rgba(0,0,0,0.7)';
        loadingIndicator.style.color = '#fff';
        loadingIndicator.style.borderRadius = '5px';
        loadingIndicator.style.zIndex = '9999';
        document.body.appendChild(loadingIndicator);
        
        // Get resume content
        const resumeContent = document.getElementById('resume-preview').innerHTML;
        const fullname = document.getElementById('fullname').value || 'Resume';
        
        // Create HTML file content
        const htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>${fullname} - Resume</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        line-height: 1.5;
                        color: #333;
                        max-width: 800px;
                        margin: 0 auto;
                        padding: 20px;
                    }
                    .resume-header {
                        text-align: center;
                        margin-bottom: 20px;
                    }
                    .resume-header h1 {
                        margin-bottom: 5px;
                    }
                    .resume-contact {
                        font-size: 14px;
                        color: #555;
                    }
                    .resume-section {
                        margin-bottom: 20px;
                    }
                    .resume-section h2 {
                        color: #3498db;
                        text-transform: uppercase;
                        border-bottom: 1px solid #ddd;
                        padding-bottom: 5px;
                        margin-bottom: 15px;
                    }
                    .resume-entry {
                        margin-bottom: 15px;
                    }
                    .resume-entry-header {
                        display: flex;
                        justify-content: space-between;
                        margin-bottom: 5px;
                    }
                    .resume-entry-title {
                        font-weight: bold;
                    }
                    .resume-entry-date {
                        color: #555;
                        font-style: italic;
                    }
                    .resume-entry-subtitle {
                        display: flex;
                        justify-content: space-between;
                        margin-bottom: 10px;
                    }
                    .resume-entry-org {
                        font-style: italic;
                    }
                    .resume-entry-location {
                        color: #555;
                    }
                    .resume-entry-description ul {
                        margin-top: 5px;
                        margin-bottom: 0;
                    }
                    .resume-skills {
                        display: grid;
                        grid-template-columns: repeat(2, 1fr);
                        gap: 20px;
                    }
                    .resume-skill-category h3 {
                        margin-bottom: 5px;
                    }
                    .resume-skill-category p {
                        margin: 0;
                    }
                </style>
            </head>
            <body>
                ${resumeContent}
            </body>
            </html>
        `;
        
        // Create a download link for the HTML file
        const blob = new Blob([htmlContent], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${fullname.replace(/\s+/g, '-')}-Resume.html`;
        
        // Trigger download
        document.body.appendChild(link);
        link.click();
        
        // Clean up
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        document.body.removeChild(loadingIndicator);
        
        // Show instructions message
        setTimeout(() => {
            alert('Resume downloaded as HTML file. To create a PDF, open the file in your browser and use the Print option (Ctrl+P or Cmd+P) to save as PDF.');
        }, 500);
    });
    }

    // Remove the original save-btn event listener
    // Since we're now using the modal download button instead
    const saveBtn = document.getElementById('save-btn');
    if (saveBtn) {
        // If you still have the save-btn in your HTML, make it open the preview modal
        saveBtn.addEventListener('click', function() {
            // Just trigger the preview button click
            document.getElementById('preview-btn').click();
        });
    }
});