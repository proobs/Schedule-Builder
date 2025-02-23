# Schedule Builder

Schedule builder, serving a solution for the University of Maryland, Baltimore County's scheduling issues

## Project Structure:

/backend - Contains the Flask application
/frontend - Contains the Vite + React application
.gitignore - Git ignore file for both environments
README.md - Project documentation

## Prerequisites:

- Python 3.7+ and pip
- Node.js 14+ and npm (or yarn)
## Setup Instructions:

### Backend (Flask):

1. Navigate to the backend directory: ``cd backend``

2. Create and activate a virtual environment: ``python3 -m venv env`` 

3. 
    - On macOS/Linux: ``source env/bin/activate``
    - On Windows: ``.\env\Scripts\activate``

4. Install dependencies: ``pip install -r requirements.txt``

5. Run the Flask server: ``python3 app.py``

The backend should now be running at http://localhost:5000

### Frontend (Vite + React):

1. Navigate to the frontend directory: cd frontend

2. Install Node dependencies: npm install

3. Start the development server: npm run dev

4. The frontend should now be running at http://localhost:3000

