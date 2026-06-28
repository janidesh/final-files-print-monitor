import os
import firebase_admin
from firebase_admin import credentials, firestore
from dotenv import load_dotenv

# Load environment variables (for Groq API Key and other configs)
load_dotenv()

# Path to your downloaded JSON key file
SERVICE_ACCOUNT_KEY_PATH = "serviceAccountKey.json"

try:
    # Initialize Firebase Admin SDK using the service account key file
    cred = credentials.Certificate(SERVICE_ACCOUNT_KEY_PATH)
    firebase_admin.initialize_app(cred)

    # Create and export the Firestore client so other files can use it
    db = firestore.client()
    print("✅ Firebase connected successfully!")

except Exception as e:
    print(f"❌ Error connecting to Firebase: {e}")
    db = None