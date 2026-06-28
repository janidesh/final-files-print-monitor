import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    todayPages: 0,
    remaining: 30,
    monthJobs: 0,
    flagged: 0
  });

  // Fetch print history from backend on load
  useEffect(() => {
    async function fetchHistory() {
      try {
        // Get the Firebase ID token
        const token = await user.getIdToken();
        
        // Call your FastAPI backend
        const res = await axios.get("http://localhost:8000/print/history", {
          headers: { Authorization: `Bearer ${token}` }
        });

        const jobsData = res.data;
        setJobs(jobsData);

        // Calculate stats
        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        let todayPages = 0;
        let monthJobs = 0;
        let flagged = 0;

        jobsData.forEach(job => {
          const jobDate = new Date(job.timestamp);
          
          // Today's pages
          if (jobDate >= todayStart) {
            todayPages += (job.pageCount * job.copies);
          }
          
          // Month count
          if (jobDate.getMonth() === now.getMonth() && jobDate.getFullYear() === now.getFullYear()) {
            monthJobs++;
          }
          
          // Flagged count
          if (job.status === "flagged") {
            flagged++;
          }
        });

        setStats({
          todayPages,
          remaining: Math.max(0, 30 - todayPages),
          monthJobs,
          flagged
        });

      } catch (error) {
        console.error("Error fetching history:", error);
      } finally {
        setLoading(false);
      }
    }

    if (user) fetchHistory();
  }, [user]);

  // Handle Logout
  async function handleLogout() {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Logout failed", error);
    }
  }

  if (loading) return <div className="text-center text-white mt-5">Loading your dashboard...</div>;

  return (
    <div className="min-vh-100 bg-dark text-white">
      {/* Navbar */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-secondary px-4 shadow">
        <span className="navbar-brand fw-bold">🖨️ OUSPMS</span>
        <div className="ms-auto d-flex align-items-center gap-3">
          <span className="text-white-50 small">Hello, {user?.email}</span>
          <button onClick={handleLogout} className="btn btn-outline-light btn-sm">Logout</button>
        </div>
      </nav>

      <div className="container py-5">
        {/* Welcome Header */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2 className="fw-bold">Welcome back! 👋</h2>
            <p className="text-white-50">Here's your printing activity today.</p>
          </div>
          <Link to="/print" className="btn btn-primary">
            🖨️ New Print Job
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="row g-4 mb-5">
          <div className="col-md-3 col-6">
            <div className="card bg-secondary text-white h-100 p-3 border-0 shadow-sm">
              <h6 className="text-white-50">📄 Pages Today</h6>
              <h3 className="fw-bold mb-0">{stats.todayPages}</h3>
            </div>
          </div>
          <div className="col-md-3 col-6">
            <div className="card bg-secondary text-white h-100 p-3 border-0 shadow-sm">
              <h6 className="text-white-50">📊 Remaining Today</h6>
              <h3 className={`fw-bold mb-0 ${stats.remaining < 5 ? "text-danger" : ""}`}>{stats.remaining}</h3>
            </div>
          </div>
          <div className="col-md-3 col-6">
            <div className="card bg-secondary text-white h-100 p-3 border-0 shadow-sm">
              <h6 className="text-white-50">📅 This Month</h6>
              <h3 className="fw-bold mb-0">{stats.monthJobs}</h3>
            </div>
          </div>
          <div className="col-md-3 col-6">
            <div className={`card h-100 p-3 border-0 shadow-sm ${stats.flagged > 0 ? "bg-danger text-white" : "bg-secondary text-white"}`}>
              <h6 className="text-white-50">⚠️ Flagged</h6>
              <h3 className="fw-bold mb-0">{stats.flagged}</h3>
            </div>
          </div>
        </div>

        {/* Recent History Table */}
        <div className="card bg-secondary text-white border-0 shadow-sm">
          <div className="card-header bg-dark text-white border-secondary border-bottom-0 fw-bold">
            📋 Recent Activity
          </div>
          <div className="card-body p-0">
            {jobs.length === 0 ? (
              <p className="text-center text-white-50 py-4 mb-0">No print jobs yet.</p>
            ) : (
              <div className="table-responsive">
                <table className="table table-dark table-hover mb-0 align-middle">
                  <thead>
                    <tr>
                      <th>Document</th>
                      <th>Pages</th>
                      <th>Copies</th>
                      <th>Type</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {jobs.slice(0, 5).map((job) => (
                      <tr key={job.jobId}>
                        <td>{job.documentName}</td>
                        <td>{job.pageCount}</td>
                        <td>{job.copies}</td>
                        <td>
                          <span className={`badge ${job.classificationResult === 'official university document' ? 'bg-success' : 'bg-warning text-dark'}`}>
                            {job.classificationResult}
                          </span>
                        </td>
                        <td>
                          <span className={`badge ${job.status === 'approved' ? 'bg-success' : job.status === 'flagged' ? 'bg-danger' : 'bg-secondary'}`}>
                            {job.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}