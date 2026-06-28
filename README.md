OUSPMS: Open University Smart Printer Monitoring System
An AI-powered web application to track, classify, and manage shared printer usage at the Open University of Sri Lanka (OUSL).

📖 Overview
Shared printers and photocopiers are essential for academic and administrative work, but they are frequently misused for personal documents (e.g., CVs, private letters) and redundant copies. These unchecked behaviors lead to significant resource wastage, inflated paper and toner costs, and unnecessary machine maintenance.

The OUSPMS addresses this challenge by leveraging Artificial Intelligence to analyze print jobs in real-time. The system classifies documents, provides emotional guidance and feedback to users, enforces printing limits, and fosters a culture of responsible resource usage—aligning with the university's digital transformation and sustainability goals.

✨ Key Features
AI-Powered Document Classification: Uses Hugging Face API and Transformers to instantly classify print jobs as either Office or Personal.

Real-Time Emotional Guidance: Delivers instant in-app notifications and feedback to users if a personal document is detected, discouraging misuse at the point of action.

Intelligent Print Validation: Enforces strict printing rules, including a maximum copy limit (≤10 copies) and daily reprint restrictions (≤3 times/day).

Role-Based Dashboards:

User Dashboard: View print history, track usage patterns, and receive real-time notifications.

Admin Dashboard: Manage users (add/remove by EPF), monitor system usage, and receive alerts on policy violations.

Dean Dashboard: Receive dedicated email alerts whenever private document printing is attempted.

Comprehensive Audit Logging: Securely logs all print attempts, document classifications, and terminated jobs to Firebase Firestore for historical reporting and accountability.

🛠️ Technology Stack
Frontend: React (with React Router & Bootstrap)

Backend: Python FastAPI (REST API architecture)

AI / NLP: Hugging Face API & Transformers (Document Classification)

Database: Firebase Firestore (User profiles, print logs, AI results)

Authentication: Firebase Authentication (EPF/Password login)

Notifications: Firebase Cloud Functions (Real-time alerts & Dean email triggers)

Hosting: Firebase Hosting / Vercel (Frontend) & Google Cloud Run / Railway (Backend)

🏗️ System Architecture
The system operates on a decoupled client-server model:

Client Layer: A web application interface where users log in and attempt to print.

Backend API: FastAPI endpoints intercept the print request.

AI Engine: The document is sent to the Hugging Face API for classification.

Database & Logging: The result and metadata are saved to Firebase Firestore.

Notification Layer: If a violation occurs, Firebase Cloud Functions trigger real-time prompts and email alerts.

(Suggested: Include your Use Case diagram from Page 5 of "7 SEP Proje P.docx" in the repository images folder and link it here)

[Insert Use Case Diagram here]

🚀 Installation & Setup
Prerequisites
Node.js (v18+)

Python (v3.9+)

Firebase Project (with Authentication & Firestore enabled)

Hugging Face API Access Token

Steps
Clone the repository:

bash
git clone https://github.com/yourusername/OUSPMS.git
cd OUSPMS
Backend Setup (Python FastAPI):

bash
cd backend
pip install -r requirements.txt
# Create .env file with your Firebase credentials and HuggingFace API key
uvicorn main:app --reload
Frontend Setup (React):

bash
cd frontend
npm install
# Configure your Firebase Config in a .env file or config.js
npm start
🔮 Future Scope
Integration with actual printer spoolers to automate job cancellation.

Advanced predictive analytics to forecast peak printing times and seasonal resource consumption.

Expansion of the AI model to categorize specific document types (e.g., Lecture notes vs. Research papers).

👤 Author
J.D. Rathnayake
BSc Computer Science (Major), Open University of Sri Lanka
https://img.shields.io/badge/Email-janithrathnayake650@gmail.com-blue

📄 License
This project is licensed under the MIT License.
