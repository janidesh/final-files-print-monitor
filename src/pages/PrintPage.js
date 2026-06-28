import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { classifyDocument, submitPrintJob } from "../services/api";
import "bootstrap/dist/css/bootstrap.min.css";

export default function PrintPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // State variables
  const [currentStep, setCurrentStep] = useState(1);
  const [file, setFile] = useState(null);
  const [copies, setCopies] = useState(1);
  const [analysing, setAnalysing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // --- STEP 1: Upload ---
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setError("");
    setAnalysisResult(null);
  };

  const handleAnalyse = async () => {
    if (!file) {
      setError("Please select a file first.");
      return;
    }
    setAnalysing(true);
    setError("");
    try {
      const result = await classifyDocument(user, file, copies);
      setAnalysisResult(result);
      setCurrentStep(2);
    } catch (err) {
      setError("Failed to analyse document. Please try again.");
    } finally {
      setAnalysing(false);
    }
  };

  // --- STEP 2: Confirmation ---
  const handleConfirmSubmit = async () => {
    setSubmitting(true);
    try {
      await submitPrintJob(user, {
        documentName: file.name,
        pageCount: 1, // Simplification: assume 1 page for demo
        copies: copies,
        classificationResult: analysisResult.classification,
        isApproved: !analysisResult.is_misuse
      });
      alert("✅ Print job submitted successfully!");
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to submit print job.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-vh-100 bg-dark text-white py-5">
      <div className="container" style={{ maxWidth: "700px" }}>
        <div className="card bg-secondary text-white border-0 shadow-lg p-4">
          
          {/* Step Indicator */}
          <div className="d-flex justify-content-between mb-4 border-bottom border-secondary pb-3">
            <span className={`fw-bold ${currentStep >= 1 ? "text-info" : "text-white-50"}`}>1. Upload</span>
            <span className={`fw-bold ${currentStep >= 2 ? "text-info" : "text-white-50"}`}>2. AI Analysis</span>
            <span className={`fw-bold ${currentStep >= 3 ? "text-info" : "text-white-50"}`}>3. Confirm</span>
          </div>

          {error && <div className="alert alert-danger">{error}</div>}

          {/* STEP 1: Upload File */}
          {currentStep === 1 && (
            <div>
              <h3 className="fw-bold mb-3">📎 Upload Your Document</h3>
              <p className="text-white-50 small">Support: .pdf, .txt</p>
              
              <div className="mb-3">
                <input 
                  type="file" 
                  className="form-control bg-dark text-white border-secondary" 
                  onChange={handleFileChange}
                  accept=".pdf,.txt"
                />
                {file && <div className="mt-2 text-success small">✅ Selected: {file.name}</div>}
              </div>

              <div className="mb-4 d-flex align-items-center gap-3">
                <label className="fw-bold mb-0">Copies:</label>
                <button className="btn btn-outline-light btn-sm" onClick={() => setCopies(Math.max(1, copies - 1))}>-</button>
                <span className="fw-bold">{copies}</span>
                <button className="btn btn-outline-light btn-sm" onClick={() => setCopies(copies + 1)}>+</button>
              </div>

              <button 
                className="btn btn-primary w-100" 
                onClick={handleAnalyse} 
                disabled={analysing || !file}
              >
                {analysing ? "🤖 Analysing with Groq..." : "Analyse Document"}
              </button>
            </div>
          )}

          {/* STEP 2: AI Result */}
          {currentStep === 2 && analysisResult && (
            <div>
              <h3 className="fw-bold mb-3">🧠 AI Classification Result</h3>
              <div className={`alert ${analysisResult.is_misuse ? "alert-warning" : "alert-success"}`}>
                <h5 className="fw-bold">{analysisResult.is_misuse ? "⚠️ Heads Up!" : "✅ Document Approved"}</h5>
                <p className="mb-0"><strong>Classification:</strong> {analysisResult.classification}</p>
                <p className="small mb-0"><strong>Confidence:</strong> {analysisResult.confidence * 100}%</p>
              </div>
              
              <div className="bg-dark p-3 rounded mb-4 border border-secondary">
                <p className="mb-0 text-white-50 small">{analysisResult.guidance_message}</p>
              </div>

              <div className="d-flex gap-3">
                <button className="btn btn-secondary flex-grow-1" onClick={() => setCurrentStep(1)}>
                  ← Upload Again
                </button>
                <button 
                  className={`btn ${analysisResult.is_misuse ? "btn-warning" : "btn-success"} flex-grow-1`} 
                  onClick={handleConfirmSubmit}
                  disabled={submitting}
                >
                  {submitting ? "Submitting..." : analysisResult.is_misuse ? "Print Anyway" : "Proceed to Print"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}