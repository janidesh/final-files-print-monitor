import axios from "axios";
import { db } from "../firebase";
import { doc, getDoc, setDoc } from "firebase/firestore"; 

// 💀 THE ATOMIC FIX: Hardcoded to the live Render URL. No more environment variables!
const API_URL = "https://portfolio-piece-5.onrender.com";

// 🚨 DEBUG LOG: Check the Browser Console (F12) to see this exact message.
console.log("✅ FINAL HARDCODED URL LOADED:", API_URL);

// Helper to get the Firebase Auth token
const getAuthHeaders = async (user) => {
  const token = await user.getIdToken();
  return { Authorization: `Bearer ${token}` };
};

// --- USER FUNCTIONS ---

// 1. Classify Document (Upload File & Run AI)
export const classifyDocument = async (user, file, copies) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("copies", copies);

  const headers = await getAuthHeaders(user);
  
  const response = await axios.post(`${API_URL}/classify/document`, formData, {
    headers: { ...headers, "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

// 2. Submit Print Job (Save to Firestore)
export const submitPrintJob = async (user, data) => {
  const headers = await getAuthHeaders(user);
  const response = await axios.post(`${API_URL}/print/submit`, data, { headers });
  return response.data;
};

// 3. Get User's Print History
export const getUserPrintHistory = async (user) => {
  const headers = await getAuthHeaders(user);
  const response = await axios.get(`${API_URL}/print/history`, { headers });
  return response.data;
};

// --- ADMIN FUNCTIONS ---

// 4. Admin: Get All Print Jobs (or only flagged ones)
export const getAllPrintJobs = async (user, flaggedOnly = false) => {
  const headers = await getAuthHeaders(user);
  const url = `${API_URL}/print/admin/all${flaggedOnly ? '?flagged=true' : ''}`;
  const response = await axios.get(url, { headers });
  return response.data;
};

// 5. Admin: Mark a job as reviewed
export const markJobReviewed = async (user, jobId) => {
  const headers = await getAuthHeaders(user);
  const response = await axios.patch(`${API_URL}/print/admin/review/${jobId}`, {}, { headers });
  return response.data;
};

// 6. Admin: Fetch Settings from Firestore
export const getSettings = async () => {
  const settingsRef = doc(db, "settings", "global");
  const snap = await getDoc(settingsRef);
  if (snap.exists()) {
    return snap.data();
  }
  return { dailyLimit: 30, allowPersonalPrinting: false };
};

// 7. Admin: Update Settings in Firestore
export const updateSettings = async (newSettings) => {
  const settingsRef = doc(db, "settings", "global");
  await setDoc(settingsRef, newSettings, { merge: true });
  return newSettings;
};