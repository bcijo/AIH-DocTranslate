# AIH-DocTranslate
An easy communication tool between doctors and the patients.

This project consists of two main parts:
1. **Frontend** - A React application located in the `my-react-app` folder.
2. **Backend** - A Flask application located in the `backend` folder.

Follow the instructions below to clone and run this project locally.

## Features under Development

- Responsive app development.
- Analytics dashboard for the doctor.
- Medical History summary for the patient.
- Doctor availability prediction for the patient.

## Prerequisites

Make sure you have the following tools installed on your system:

- [Node.js](https://nodejs.org/) (includes npm)
- [Python](https://www.python.org/)
- [Firebase CLI](https://firebase.google.com/docs/cli)

## 1. Clone the repository

Clone the repository to your local machine:

```bash
git clone https://github.com/bcijo/AIH-DocTranslate.git
cd full-app
```

## 2. Set up the frontend (React app)

### Install npm dependencies
Navigate to the `my-react-app` folder: 

```bash
cd my-react-app
```

Then, install the necessary npm packages:
```bash
npm install
```

### Set up Firebase

1. Install Firebase CLI globally if you haven't already:
```bash
npm install firebase
```

### Run the FrontEnd

Once Firebase is set up and dependencies are installed, you can run the frontend app inside `my-react-app`:
```bash
npm start
```

This will start the React development server and you can access the app at `http://localhost:3000`

## 3. Set up the backend (Flask app)

### nstall Python dependencies

Navigate to the `backend` folder:
```bash
cd ../backend
```

Create a virtual environment (optional but recommended):
```bash
python -m venv venv
```

Activate the virtual environment:

- For macOS/Linux:
```
source venv/bin/activate
```

- For Windows:
```
.\venv\Scripts\activate
```

Install the required Python packages:
```
pip install -r requirements.txt
```

### Run the Flask BackEnd

To start the Flask server, run:

```bash
flask run
```

This will start the Flask server on `http://127.0.0.1:5000`

## 4. Access the Application 
- Frontend: Go to `http://localhost:3000` in your browser to view the React app. 
- Backend: The Flask server will run on `http://127.0.0.1:5000`.
