from flask import Flask, render_template, request, session, redirect, url_for
from package.interviewbot import generate_recruitment_question, validate_answer,send_email

from azure.storage.blob import BlobServiceClient
from io import StringIO,BytesIO
from flask_cors import CORS
from dotenv.main import load_dotenv
from langchain.llms import OpenAI
from langchain.llms import OpenAIChat
from langchain.chains import ConversationChain
from langchain.memory import ConversationBufferMemory
from langchain import LLMChain, PromptTemplate
import google.generativeai as genai
import tempfile
import random
load_dotenv()
import fitz
import os
import re
import openai
app = Flask(__name__)

container_name = "csv"
blob_service_client = BlobServiceClient.from_connection_string(conn_str='')

try:
    
    container_client = blob_service_client.get_container_client(container=container_name) # get container client to interact with the container in which images will be stored
    container_client.get_container_properties() # get properties of the container to force exception to be thrown if container does not exist
except Exception as e:
    print(e)
    print("Creating container...")
    container_client = blob_service_client.create_container(container_name) # create a container in the storage account if it does not exist
container_client.get_container_properties() #
# os.environ["OPENAI_API_KEY"] = os.getenv("OPENAI_API_KEY")

def extract_text_from_pdf(pdf_path):
    resume_text = ""
    pdf_document = fitz.open(pdf_path)
    for page_num in range(pdf_document.page_count):
        page = pdf_document.load_page(page_num)
        resume_text += page.get_text("text")
    pdf_document.close()
    return resume_text
@app.route('/welcomePage')
def index():
    return render_template('index.html')
@app.route('/analyze_cv')
def analyseCv():
    return render_template('analyzeCV.html')
@app.route('/analyze_job')
def analyseJob():
    return render_template('analyzeJob.html')
@app.route('/analyze_job', methods=['POST'])
def upload_job():
    if request.method == 'POST':
        if 'file' in request.files:  # User chose the file upload option
            file = request.files['file']
            filenames=""
            if file:
                try:
                    container_client.upload_blob(f"{file.filename}", file,overwrite=True) # upload the file to the container using the filename as the blob name
                    filenames += file.filename + "<br /> "
                except Exception as e:
                    print(e)
                    print("Ignoring duplicate filenames") # ignore duplicate filenames
                blob_client = container_client.get_blob_client(file.filename) # get blob client to interact with the blob and get blob url
                with BytesIO() as input_blob:
                    blob_client.download_blob().download_to_stream(input_blob)
                    input_blob.seek(0)
                    with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as temp_file:
                        temp_file.write(input_blob.read())
                        temp_file_path = temp_file.name
                    resume_text = extract_text_from_pdf(temp_file_path)
                    os.remove(temp_file_path)
            
                template = """
                For the following job description pdf, extract the following: company name, job description, company description, 
                job requirements. Start each group following this pattern: [<GROUP NAME>], e.g. for 'Skills' do '[SKILLS]'. 
                Return the information as detailed as possible
    

                {chat_history}
                {human_input}"""
            
                prompt = PromptTemplate(
                    input_variables=["chat_history", "human_input"],
                    template=template
                )

                memory = ConversationBufferMemory(memory_key="chat_history")

                llm_chain = LLMChain(
                    llm=OpenAIChat(model="gpt-3.5-turbo"),
                    prompt=prompt,
                    verbose=True,
                    memory=memory,
                )

                res = llm_chain.predict(human_input=resume_text)
                print(res)
                return render_template('analyzeJob.html', parsed_resume=res, error=None)
            else:
                return render_template('analyzeJob.html', parsed_resume=None, error='Error uploading file. Only PDFs are allowed.')
        elif 'job_description' in request.form:  # User chose the textarea option
            job_description = request.form['job_description']
            template = """
                For the following job description text, extract the following: company name, job description, company description, 
                job requirements. Start each group following this pattern: [<GROUP NAME>], e.g. for 'Skills' do '[SKILLS]'. 
                Return the information as detailed as possible
    

                {chat_history}
                {human_input}"""
            
            prompt = PromptTemplate(
                    input_variables=["chat_history", "human_input"],
                    template=template
                )

            memory = ConversationBufferMemory(memory_key="chat_history")

            llm_chain = LLMChain(
                    llm=OpenAIChat(model="gpt-3.5-turbo"),
                    prompt=prompt,
                    verbose=True,
                    memory=memory,
                )

            res = llm_chain.predict(human_input=job_description)

            return render_template('analyzeJob.html', parsed_resume=res, error=None)
    return render_template('analyzeJob.html', parsed_resume=None, error='Error uploading file.')

@app.route('/analyze_cv', methods=['POST'])
def upload_cv():
    if request.method == 'POST':
        file = request.files['file']
        filenames=""
        if file:
            try:
                container_client.upload_blob(f"{file.filename}", file,overwrite=True) # upload the file to the container using the filename as the blob name
                filenames += file.filename + "<br /> "
            except Exception as e:
                print(e)
                print("Ignoring duplicate filenames") # ignore duplicate filenames
            blob_client = container_client.get_blob_client(file.filename) # get blob client to interact with the blob and get blob url
            with BytesIO() as input_blob:
                blob_client.download_blob().download_to_stream(input_blob)
                input_blob.seek(0)
                with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as temp_file:
                    temp_file.write(input_blob.read())
                    temp_file_path = temp_file.name
                resume_text = extract_text_from_pdf(temp_file_path)
                os.remove(temp_file_path)
           
            """
           Extract information from the CV provided. Return the information grouped under the following: Contact, 
            Academic Background, Professional Experience, Skills, Other. Start each group following this pattern: 
            [<GROUP NAME>], e.g. for 'Skills' do '[SKILLS]'. . Return the information as detailed as possible.
            CV:
            """
            template = """
     You are an expert technical recruiter tasked with evaluating a candidate's CV.

CV TEXT TO ANALYZE:
{resume_text}

Based ONLY on the CV text above, generate a detailed Technical Skill Assessment Report with the following structure:

1. Candidate Information:
   - Extract the candidate's actual name and email from the CV
   - If this information is not in the CV, write "Not available in CV"

2. Assessment Overview:
   - Assessment Name: Technical Skills Assessment - CV Review
   - Assessment Type: CV-based Evaluation
   - Total Score: [Give an honest score out of 10 based on the technical skills shown in the CV]

3. Technical Skills Evaluation:
   - Only assess skills that are ACTUALLY MENTIONED in the CV
   - For each skill category (Programming Languages, Web Development, Database Management):
     * List only technologies mentioned in the CV
     * Score each on a scale of 1-10 based on the depth of experience shown
     * Provide a brief explanation justifying each score based on specific information in the CV
   - For Problem-Solving: Evaluate based on projects, challenges, or achievements mentioned

4. Assessment Summary:
   - Write a concise summary of the candidate's technical profile
   - List specific strengths backed by CV evidence
   - Identify areas for improvement based on role requirements vs. CV content

5. Recommendations:
   - Provide actionable recommendations based on the CV analysis
   - Clearly state whether the candidate seems suitable for a technical role based on CV content

6. Comments:
   - Include observations about the overall quality and presentation of the CV

IMPORTANT:
- Do NOT include skills that aren't mentioned in the CV
- Base ALL scores on ACTUAL evidence from the CV
- Be specific and reference actual projects or experiences from the CV
- Do not use placeholder text like [Score out of 10] in your final output
                    """
           
            prompt = template.format(resume_text=resume_text)
            
            try:
                # Initialize Gemini
                
                
                # Configure with your API key
                        genai.configure(api_key="AIzaSyA4JBcd034sUeryEsrrCjsT7crpP0i1mzA")
                
                # Create the model
                        model = genai.GenerativeModel('gemini-1.5-pro')
                
                # Generate the analysis
                        response = model.generate_content(prompt)
                
                # Return the analysis result
                        return render_template('analyzeCV.html', parsed_resume=response.text)
            except Exception as e:
                        return render_template('analyzeCV.html', parsed_resume=None, error=f'Error analyzing CV: {str(e)}')
        else:
                return render_template('analyzeCV.html', parsed_resume=None, error='Error uploading file. Only PDFs are allowed.')
    return render_template('analyzeCV.html', parsed_resume=None, error='Error uploading file.')

def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() == "pdf"

app.secret_key = "12uwnasdfw" 

programming_topics = [
    "Variables and Data Types",
    "Operators and Expressions",
    "Control Flow (if-else, loops)",
    "Functions and Methods",
    "Object-Oriented Programming (OOP)",
    "Classes and Objects",
    "Inheritance and Polymorphism",
    "Encapsulation and Abstraction",
    "File Handling and I/O",
    "Exception Handling",
    "Recursion",
    "Data Structures (Lists, Sets, Tuples, Dictionaries)",
    "Algorithms (Sorting, Searching, etc.)",
    "Regular Expressions",
    "Lambda Functions",
    "Functional Programming",
    "Generators and Iterators",
    "Decorators",
    "Modules and Packages",
    "Namespaces and Scope",
    "Closures",
    "Multithreading and Multiprocessing",
    "Networking and Socket Programming",
    "Web Scraping",
    "JSON and APIs",
    "GUI Programming (Tkinter, PyQt, etc.)",
    "Database Interaction (SQL, SQLite, etc.)",
    "Unit Testing and Test-Driven Development (TDD)",
    "Debugging Techniques",
    "Performance Optimization",
    "Design Patterns",
    "Software Development Life Cycle (SDLC)",
    "Version Control (Git, SVN, etc.)",
    "Continuous Integration and Deployment (CI/CD)",
    "Security Best Practices in Programming",
    "Concurrency and Parallel Programming",
    "Asynchronous Programming (async/await)",
    "Data Serialization (XML, JSON, Pickle, etc.)",
    "Interprocess Communication (IPC)",
    "Code Documentation and Commenting"
]

topics = [
    "Technical Skills",
    "Mathematics",
    "Problem Solving",
    "Soft Skills",
    "Domain-Specific Knowledge",
    "General Knowledge",
    "Language Proficiency",
    "Industry-Specific Topics",
    "Role-Specific Competencies",
    "Behavioral Questions",
    "Mathematics",
    "English Language Proficiency",
    "Programming",
    "Problem Solving",
    "Analytical Skills",
    "Verbal Communication",
    "Written Communication",
    "Logical Reasoning",
    "Time Management",
    "Critical Thinking",
    "Creativity",
    "Attention to Detail",
    "Teamwork",
    "Adaptability",
    "Customer Service",
    "Data Analysis",
    "Project Management",
    "Leadership",
    "Technical Skills",
    "Coding Skills"
]
@app.route('/')
def welcome():
    return render_template('welcome.html')

@app.route('/technical_Assessment')
def technical_assessment():
    return render_template('assessment1.html')

@app.route('/final_AssessmentHome')
def final_assessmentWelcome():
    return render_template('assessment2.html')

@app.route('/initialAssessment',methods=['GET', 'POST'])
def initialAssessment():
    
    no_questions=5
    
    # Initialize session variable if not present
    if 'email' not in session:
        session['email'] = ""
    if 'name' not in session:
        session['name'] = ""
    
    if request.method == 'POST':
        # Retrieve the email and name from the form
        email = request.form.get('email')
        name = request.form.get('name')
        session['email'] = email
        session['name'] = name
    
   
    if 'question_count' not in session:
        session['question_count'] = 0

    # Check if the user has reached the limit of 10 questions
    if session['question_count'] >= no_questions:
                total_score =session.get('individual_scores')
                session.clear()

        # Render the thank you template
                return render_template('thank_you.html',total_score=total_score)

    # Generate a question
    random_topic = random.choice(topics)
    
    #1prompt = f"You are the hiring manager for a growing tech company. Please generate a random Multiple Choice Question from provided text {QuestionText} with options. This text contain Multiple choice questios in list format where questions and each options must be act as list value  . You have to generate that questions randomly"

    #2 You are the hiring manager for a growing tech company. Please generate a quiz type question for a Python developer position related to  {random_topic}

    prompt=f"You are the performing a skill assessment test for a candidate. Please generate a Multiple Choice Question for Initial assessement related to topic {random_topic}"
    question = generate_recruitment_question(prompt)

    print(question)

    # Increment the question count in the session
    session['question_count'] += 1

    # Render the template with the question
    return render_template('new_index.html',question=question,question_count=session['question_count'])


@app.route('/validate', methods=['POST'])
def validate():
    no_questions=5
   

    question = request.form['question']
    candidate_answer = request.form['candidate_answer']
    print(question)
    print(candidate_answer)

    # Validate the answer and get the score
   
    def is_integer_string(s):
        try:
            int(s)
            return True
        except ValueError:
            return False

    # Assuming you have the 'score' variable as a string
    score = validate_answer(question, candidate_answer)
    print("score=",score)
    # Check if the score is an integer string
    if is_integer_string(score):
        score = int(score)
    else:
        score = 0
    if 'individual_scores' not in session:
        session['individual_scores'] = 0
    print("score2=",score)
    # Append the current score to the list of individual scores
    session['individual_scores']+=score
    print("Individual Scores:", session['individual_scores'])

    # Check if the user has completed 10 questions
    print("Session_question=",session['question_count'])
    if session['question_count'] >= no_questions:
        # Calculate the total score
        total_score = session['individual_scores']
        print("Total Score:", total_score)


        # Configure Gemini
        genai.configure(api_key="AIzaSyA4JBcd034sUeryEsrrCjsT7crpP0i1mzA")  # Replace with your actual API key

        # Create the prompt
        prompt = f"""
        You work at a company named AICTE Government Recruitment. 
        Your job is to write official mails to candidates informing them if they have passed or failed the hiring test.
        To pass the test the candidate must score above the cutoff score of 20 out of 50.
        You only have to write the body of the email and nothing else. 
        The name of the candidate is {session['name']}. The candidate scored {total_score} marks out of 50. Write an email to inform them about the result.
        You only have to write if the candidate passed or failed. Do not reveal their marks under any circumstances.
        """

        # Create the model with temperature setting
        model = genai.GenerativeModel('gemini-1.5-pro', 
                                    generation_config={
                                        "temperature": 0.9
                                    })

        # Generate the email content
        response = model.generate_content(prompt)
        email_body = response.text

        send_email(session['email'], email_body)
        session.clear()  # Clear the session data after calculating the total score

        # Render the thank you template with the total score
        return render_template('thank_you.html', total_score=total_score)


    # Render the template with the score and the next question
    return render_template('score.html', question=question,answer= candidate_answer, score=score)



@app.route('/finalAssessment',methods=['GET', 'POST'])
def finalAssessment():
    

    
    no_questions=5
    
    # Initialize session variable if not present
    if 'email' not in session:
        session['email'] = ""
    if 'name' not in session:
        session['name'] = ""
    
    if request.method == 'POST':
        # Retrieve the email and name from the form
        email = request.form.get('email')
        name = request.form.get('name')
        session['email'] = email
        session['name'] = name
    
   
    if 'question_count' not in session:
        session['question_count'] = 0

    # Check if the user has reached the limit of 10 questions
    if session['question_count'] >= no_questions:
                total_score = sum(session.get('individual_scores'))
                
        
               
                session.clear()

        # Render the thank you template
                return render_template('thank_you.html',total_score=total_score)

    # Generate a question
    random_topic = random.choice(topics)

    QuestionText=extract_text_from_pdf("MCQQuestions.pdf")
    
    #1prompt = f"You are the hiring manager for a growing tech company. Please generate a random Multiple Choice Question from provided text {QuestionText} with options. This text contain Multiple choice questios in list format where questions and each options must be act as list value  . You have to generate that questions randomly"

    #2 You are the hiring manager for a growing tech company. Please generate a quiz type question for a Python developer position related to  {random_topic}

    prompt=f"""You are doing final assessment from question bank provided to you. Please generate random Multiple Choice Question from provided question bank {QuestionText} with options. This text contain Multiple choice questions."""
    question = generate_recruitment_question(prompt)

    print(question)

    # Increment the question count in the session
    session['question_count'] += 1

    # Render the template with the question
    return render_template('finalAssessment.html',question=question,question_count=session['question_count'])

@app.route('/finalAssessmentValidate', methods=['POST'])
def finalAssessmentValidate():
    no_questions=5
   

    question = request.form['question']
    candidate_answer = request.form['candidate_answer']
    print(question)
    print(candidate_answer)

    # Validate the answer and get the score
   
    def is_integer_string(s):
        try:
            int(s)
            return True
        except ValueError:
            return False

    # Assuming you have the 'score' variable as a string
    score = validate_answer(question, candidate_answer)
    print("score=",score)
    # Check if the score is an integer string
    if is_integer_string(score):
        score = int(score)
    else:
        score = 0
    if 'individual_scores' not in session:
        session['individual_scores'] = 0
    print("score2=",score)
    # Append the current score to the list of individual scores
    session['individual_scores']+=score
    print("Individual Scores:", session['individual_scores'])

    # Check if the user has completed 10 questions
    print("Session_question=",session['question_count'])
    if session['question_count'] >= no_questions:
        # Calculate the total score
        total_score = session['individual_scores']
        print("Total Score:", total_score)
        llm = OpenAI(temperature=0.9)
        prompt = PromptTemplate(
        input_variables=["name","score","cutoff","company_name"],
        template="""
                    You work at a company named {company_name}. 
                    Your job is to write official mails to candidaes informing them if they have passed or failed the hiring test.
                    To pass the test the candidate must score above the cutoff score of {cutoff} out of 5.
                    You only have to write the body of the email and nothing else. 
                    The name of the candidate is {name}. The candidate scored {score} marks out of 5. Write an email to inform them about the result.
                    You only have to write if the candidate passed or failed. Do not reveal their marks under any circumstances.
                    """,
                    )
                
        chain = LLMChain(llm=llm, prompt=prompt)
        cutoff=3
        k=chain.run({
                "name":session['name'],
                "cutoff":cutoff,

                "score":total_score,
                "company_name":"AICTE Government Recruitment",
        })
        print(session["email"])
        send_email("yash191174@gmail.com",k)
        session.clear()  # Clear the session data after calculating the total score

        # Render the thank you template with the total score
        return render_template('thank_you.html', total_score=total_score)


    # Render the template with the score and the next question
    return render_template('finalAssessmentScore.html', question=question,answer= candidate_answer, score=score)
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5001))  # Default to 5001 if PORT env variable is not set
    app.run(debug=True, port=port)