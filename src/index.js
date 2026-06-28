import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import ErrorBoundary from './ErrorBoundary'; // ✅ Now this will actually exist

console.log("🚀 React Entry Point Started");

const rootElement = document.getElementById('root');
console.log("Root element found:", rootElement ? "YES" : "NO");

if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  try {
    root.render(
      <React.StrictMode>
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
      </React.StrictMode>
    );
    console.log("✅ React successfully mounted!");
  } catch (e) {
    console.error("❌ React crashed on render:", e);
    rootElement.innerHTML = `<div style="padding:40px;color:white;background:#111;">
      <h1 style="color:red;">React Crash Detected</h1>
      <pre style="color:#ffbbbb;">${e.toString()}</pre>
    </div>`;
  }
} else {
  console.error("❌ FATAL: Could not find 'root' div!");
}