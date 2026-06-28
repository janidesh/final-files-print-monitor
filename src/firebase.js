import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics"; // Added back in case you need it later

// Build the config from your .env file
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
};

// 🛡️ SAFETY CHECK: Only initialize if the config is valid
let app;
let analytics;
if (firebaseConfig.apiKey && firebaseConfig.authDomain) {
  app = initializeApp(firebaseConfig);
  analytics = getAnalytics(app); // Initialize Analytics only if available
} else {
  console.error("❌ Firebase Error: REACT_APP_* variables are missing in your .env file!");
  app = null;
  analytics = null;
}

// Export Auth and Database
export const auth = app ? getAuth(app) : null;
export const db = app ? getFirestore(app) : null;
export { analytics };