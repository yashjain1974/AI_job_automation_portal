from flask import Flask, render_template, request, redirect, url_for, session, jsonify, flash
import os
import firebase_admin
from firebase_admin import credentials, auth, firestore
import json
from functools import wraps
from datetime import datetime, timedelta

app = Flask(__name__)
app.secret_key = '123321123VGGH'  # Change this to a random string

# Initialize Firebase Admin SDK
# Replace with your Firebase service account key path
cred = credentials.Certificate("recruitment-portal-automation-firebase-adminsdk-fbsvc-82134b254b.json")
firebase_admin.initialize_app(cred)

# Initialize Firestore
db = firestore.client()

# Login required decorator
def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            return redirect(url_for('login'))
        return f(*args, **kwargs)
    return decorated_function

# Check role decorator
def role_required(role):
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            if 'user_role' not in session or session['user_role'] != role:
                return redirect(url_for('login'))
            return f(*args, **kwargs)
        return decorated_function
    return decorator

# Routes
@app.route('/')
def index():
    if 'user_id' in session:
        if session['user_role'] == 'candidate':
            return redirect(url_for('candidate_dashboard'))
        else:
            return redirect(url_for('recruiter_dashboard'))
    return render_template('login.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if 'user_id' in session:
        if session['user_role'] == 'candidate':
            return redirect(url_for('candidate_dashboard'))
        else:
            return redirect(url_for('recruiter_dashboard'))
    return render_template('login.html')

@app.route('/api/check_user_role', methods=['POST'])
def check_user_role():
    data = request.json
    uid = data.get('uid')
    
    try:
        # Get user document from Firestore
        user_doc = db.collection('users').document(uid).get()
        
        if user_doc.exists:
            user_data = user_doc.to_dict()
            role = user_data.get('role', '')
            
            # Set session data
            session['user_id'] = uid
            session['user_role'] = role
            session['user_name'] = user_data.get('displayName', '')
            session['user_email'] = user_data.get('email', '')
            
            return jsonify({
                'success': True,
                'role': role,
                'redirect': url_for('candidate_dashboard' if role == 'candidate' else 'recruiter_dashboard')
            })
        else:
            return jsonify({
                'success': False,
                'message': 'User not found in database'
            })
    except Exception as e:
        return jsonify({
            'success': False,
            'message': str(e)
        })
        
# Dashboard routes
@app.route('/candidate/dashboard')
@login_required
@role_required('candidate')
def candidate_dashboard():
    return render_template('candidate_dashboard.html')

@app.route('/recruiter/dashboard')
@login_required
@role_required('recruiter')
def recruiter_dashboard():
    return render_template('recruiter_dashboard.html')

# API routes for candidate
@app.route('/api/candidate/profile', methods=['GET'])
@login_required
@role_required('candidate')
def get_candidate_profile():
    try:
        user_id = session['user_id']
        user_doc = db.collection('users').document(user_id).get()
        
        if user_doc.exists:
            user_data = user_doc.to_dict()
            return jsonify({
                'success': True,
                'profile': user_data
            })
        else:
            return jsonify({
                'success': False,
                'message': 'Profile not found'
            })
    except Exception as e:
        return jsonify({
            'success': False,
            'message': str(e)
        })

@app.route('/api/candidate/applications', methods=['GET'])
@login_required
@role_required('candidate')
def get_candidate_applications():
    try:
        user_id = session['user_id']
        applications = []
        
        # Get applications from Firestore
        application_docs = db.collection('applications').where('candidateId', '==', user_id).stream()
        
        for doc in application_docs:
            app_data = doc.to_dict()
            app_data['id'] = doc.id
            
            # Get job details
            if 'jobId' in app_data:
                job_doc = db.collection('jobs').document(app_data['jobId']).get()
                if job_doc.exists:
                    app_data['job'] = job_doc.to_dict()
            
            applications.append(app_data)
        
        return jsonify({
            'success': True,
            'applications': applications
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'message': str(e)
        })

@app.route('/api/candidate/jobs', methods=['GET'])
@login_required
@role_required('candidate')
def get_available_jobs():
    try:
        # Get all available jobs
        jobs = []
        job_docs = db.collection('jobs').where('isActive', '==', True).stream()
        
        for doc in job_docs:
            job_data = doc.to_dict()
            job_data['id'] = doc.id
            jobs.append(job_data)
        
        return jsonify({
            'success': True,
            'jobs': jobs
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'message': str(e)
        })

@app.route('/api/candidate/apply', methods=['POST'])
@login_required
@role_required('candidate')
def apply_for_job():
    data = request.json
    job_id = data.get('jobId')
    
    try:
        user_id = session['user_id']
        
        # Check if already applied
        existing_app = db.collection('applications').where('candidateId', '==', user_id).where('jobId', '==', job_id).get()
        
        if len(existing_app) > 0:
            return jsonify({
                'success': False,
                'message': 'You have already applied for this job'
            })
        
        # Create application
        app_ref = db.collection('applications').document()
        app_ref.set({
            'candidateId': user_id,
            'jobId': job_id,
            'status': 'applied',
            'appliedAt': firestore.SERVER_TIMESTAMP,
            'lastUpdated': firestore.SERVER_TIMESTAMP
        })
        
        return jsonify({
            'success': True,
            'message': 'Application submitted successfully',
            'applicationId': app_ref.id
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'message': str(e)
        })

# API routes for recruiter
@app.route('/api/recruiter/jobs', methods=['GET'])
@login_required
@role_required('recruiter')
def get_recruiter_jobs():
    try:
        user_id = session['user_id']
        jobs = []
        
        # Get jobs from Firestore
        job_docs = db.collection('jobs').where('recruiterId', '==', user_id).stream()
        
        for doc in job_docs:
            job_data = doc.to_dict()
            job_data['id'] = doc.id
            jobs.append(job_data)
        
        return jsonify({
            'success': True,
            'jobs': jobs
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'message': str(e)
        })

@app.route('/api/recruiter/job', methods=['POST'])
@login_required
@role_required('recruiter')
def create_job():
    data = request.json
    
    try:
        user_id = session['user_id']
        
        # Create job
        job_ref = db.collection('jobs').document()
        job_ref.set({
            'title': data.get('title'),
            'company': data.get('company'),
            'location': data.get('location'),
            'description': data.get('description'),
            'requirements': data.get('requirements', []),
            'salary': data.get('salary'),
            'recruiterId': user_id,
            'isActive': True,
            'createdAt': firestore.SERVER_TIMESTAMP,
            'updatedAt': firestore.SERVER_TIMESTAMP
        })
        
        return jsonify({
            'success': True,
            'message': 'Job created successfully',
            'jobId': job_ref.id
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'message': str(e)
        })

@app.route('/api/recruiter/applications', methods=['GET'])
@login_required
@role_required('recruiter')
def get_job_applications():
    job_id = request.args.get('jobId')
    
    try:
        applications = []
        
        # Get applications from Firestore
        query = db.collection('applications')
        
        if job_id:
            query = query.where('jobId', '==', job_id)
        
        application_docs = query.stream()
        
        for doc in application_docs:
            app_data = doc.to_dict()
            app_data['id'] = doc.id
            
            # Get candidate details
            if 'candidateId' in app_data:
                candidate_doc = db.collection('users').document(app_data['candidateId']).get()
                if candidate_doc.exists:
                    app_data['candidate'] = candidate_doc.to_dict()
            
            # Get job details if not filtered by job
            if not job_id and 'jobId' in app_data:
                job_doc = db.collection('jobs').document(app_data['jobId']).get()
                if job_doc.exists:
                    app_data['job'] = job_doc.to_dict()
            
            applications.append(app_data)
        
        return jsonify({
            'success': True,
            'applications': applications
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'message': str(e)
        })

@app.route('/api/recruiter/application/status', methods=['POST'])
@login_required
@role_required('recruiter')
def update_application_status():
    data = request.json
    application_id = data.get('applicationId')
    new_status = data.get('status')
    
    try:
        # Update application status
        app_ref = db.collection('applications').document(application_id)
        app_ref.update({
            'status': new_status,
            'lastUpdated': firestore.SERVER_TIMESTAMP
        })
        
        return jsonify({
            'success': True,
            'message': 'Application status updated successfully'
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'message': str(e)
        })

@app.route('/api/logout', methods=['POST'])
def logout():
    # Clear all session data, not just specific keys
    session.clear()
    
    # Invalidate the session cookie
    response = jsonify({
        'success': True,
        'redirect': url_for('logged_out')  # New route for logout page
    })
    
    # Set the session cookie to expire immediately
    response.set_cookie('session', '', expires=0)
    
    return response

@app.route('/logged-out')
def logged_out():
    return render_template('logged_out.html')

@app.route('/api/register_user', methods=['POST'])
def register_user():
    data = request.json
    uid = data.get('uid')
    email = data.get('email')
    display_name = data.get('displayName')
    role = data.get('role')
    
    try:
        # Create user document in Firestore
        user_ref = db.collection('users').document(uid)
        
        # Prepare user data
        user_data = {
            'email': email,
            'displayName': display_name,
            'role': role,
            'createdAt': firestore.SERVER_TIMESTAMP
        }
        
        # Add company name for recruiters
        if role == 'recruiter' and 'company' in data:
            user_data['company'] = data.get('company')
        
        # Set user data in Firestore
        user_ref.set(user_data)
        
        # Set session data
        session['user_id'] = uid
        session['user_role'] = role
        session['user_name'] = display_name
        session['user_email'] = email
        
        return jsonify({
            'success': True,
            'role': role,
            'redirect': url_for('candidate_dashboard' if role == 'candidate' else 'recruiter_dashboard')
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'message': str(e)
        })

# Error handlers
@app.errorhandler(404)
def page_not_found(e):
    return render_template('404.html'), 404

@app.errorhandler(500)
def server_error(e):
    return render_template('500.html'), 500

if __name__ == '__main__':
    app.run(debug=True)