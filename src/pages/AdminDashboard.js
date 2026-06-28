import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getAllPrintJobs, markJobReviewed, getSettings, updateSettings } from "../services/api";
import "bootstrap/dist/css/bootstrap.min.css";

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [allJobs, setAllJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Settings State
  const [settings, setSettings] = useState({ dailyLimit: 30, allowPersonalPrinting: false });
  const [savingSettings, setSavingSettings] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const jobs = await getAllPrintJobs(user);
        setAllJobs(jobs);
        
        const settingsData = await getSettings();
        setSettings(settingsData);
      } catch (error) {
        console.error("Error fetching admin data:", error);
      } finally {
        setLoading(false);
      }
    }
    if (user) fetchData();
  }, [user]);

  // Handle marking as reviewed
  const handleMarkReviewed = async (jobId) => {
    try {
      await markJobReviewed(user, jobId);
      setAllJobs(prev => prev.map(job => 
        job.jobId === jobId ? { ...job, status: "reviewed" } : job
      ));
    } catch (error) {
      console.error("Failed to mark as reviewed:", error);
    }
  };

  // Handle Settings Save
  const handleSaveSettings = async () => {
    setSavingSettings(true);
    try {
      await updateSettings(settings);
      alert("✅ Settings saved successfully!");
    } catch (error) {
      console.error("Failed to save settings:", error);
      alert("❌ Failed to save settings.");
    } finally {
      setSavingSettings(false);
    }
  };

  // Filter Logic
  const filteredJobs = allJobs.filter(job => {
    if (filter === "all") return true;
    return job.status === filter;
  });

  // Pagination Logic
  const totalPages = Math.ceil(filteredJobs.length / itemsPerPage);
  const displayedJobs = filteredJobs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Stats calculation
  const today = new Date().toISOString().slice(0, 10);
  const stats = {
    totalToday: allJobs.filter(j => j.timestamp.startsWith(today)).length,
    flagged: allJobs.filter(j => j.status === "flagged").length,
    approved: allJobs.filter(j => j.status === "approved").length,
    pagesToday: allJobs
      .filter(j => j.timestamp.startsWith(today))
      .reduce((sum, j) => sum + (j.pageCount * j.copies), 0),
  };

  if (loading) return <div className="text-center text-white mt-5">Loading Admin Panel...</div>;

  return (
    <div className="min-vh-100 bg-dark text-white">
      {/* Navbar */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-secondary px-4 shadow">
        <span className="navbar-brand fw-bold">⚙️ Admin Control Panel</span>
        <div className="ms-auto d-flex align-items-center gap-3">
          <span className="text-white-50 small">Admin: {user?.email}</span>
          <button onClick={logout} className="btn btn-outline-light btn-sm">Logout</button>
        </div>
      </nav>

      <div className="container py-5">
        <h2 className="fw-bold mb-4">System Overview</h2>

        {/* Stats Cards */}
        <div className="row g-4 mb-5">
          <div className="col-md-3 col-6">
            <div className="card bg-secondary text-white h-100 p-3 border-0 shadow-sm">
              <h6 className="text-white-50">📊 Total Today</h6>
              <h3 className="fw-bold mb-0">{stats.totalToday}</h3>
            </div>
          </div>
          <div className="col-md-3 col-6">
            <div className="card bg-danger text-white h-100 p-3 border-0 shadow-sm">
              <h6 className="text-white-50">🚨 Flagged</h6>
              <h3 className="fw-bold mb-0">{stats.flagged}</h3>
            </div>
          </div>
          <div className="col-md-3 col-6">
            <div className="card bg-success text-white h-100 p-3 border-0 shadow-sm">
              <h6 className="text-white-50">✅ Approved</h6>
              <h3 className="fw-bold mb-0">{stats.approved}</h3>
            </div>
          </div>
          <div className="col-md-3 col-6">
            <div className="card bg-secondary text-white h-100 p-3 border-0 shadow-sm">
              <h6 className="text-white-50">📄 Pages Today</h6>
              <h3 className="fw-bold mb-0">{stats.pagesToday}</h3>
            </div>
          </div>
        </div>

        {/* Flagged Jobs Section */}
        <div className="card bg-secondary text-white border-0 shadow-sm mb-5">
          <div className="card-header bg-dark text-white border-secondary border-bottom-0 fw-bold">
            ⚠️ Flagged Print Jobs <span className="badge bg-danger ms-2">{stats.flagged}</span>
          </div>
          <div className="card-body p-0">
            {allJobs.filter(j => j.status === "flagged").length === 0 ? (
              <p className="text-center text-white-50 py-4 mb-0">✅ No flagged jobs. All clear!</p>
            ) : (
              <div className="table-responsive">
                <table className="table table-dark table-hover mb-0 align-middle">
                  <thead>
                    <tr>
                      <th>User</th><th>Document</th><th>Pages</th><th>Copies</th><th>Date</th><th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allJobs.filter(j => j.status === "flagged").map((job) => (
                      <tr key={job.jobId} style={{ backgroundColor: "#442222" }}>
                        <td>{job.userEmail}</td>
                        <td>{job.documentName}</td>
                        <td>{job.pageCount}</td>
                        <td>{job.copies}</td>
                        <td>{new Date(job.timestamp).toLocaleDateString()}</td>
                        <td>
                          <button className="btn btn-outline-success btn-sm" onClick={() => handleMarkReviewed(job.jobId)}>
                            Mark Reviewed ✓
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* All Jobs Table with Filter */}
        <div className="card bg-secondary text-white border-0 shadow-sm mb-5">
          <div className="card-header bg-dark text-white border-secondary border-bottom-0 d-flex justify-content-between align-items-center">
            <span className="fw-bold">📋 All Jobs</span>
            <div className="btn-group btn-group-sm">
              {["all", "flagged", "approved", "reviewed"].map((f) => (
                <button key={f} className={`btn ${filter === f ? "btn-primary" : "btn-outline-light"}`} onClick={() => { setFilter(f); setCurrentPage(1); }}>
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-dark table-hover mb-0 align-middle">
                <thead>
                  <tr><th>User</th><th>Document</th><th>Pages</th><th>Copies</th><th>Type</th><th>Status</th><th>Date</th></tr>
                </thead>
                <tbody>
                  {displayedJobs.map((job) => (
                    <tr key={job.jobId}>
                      <td>{job.userEmail}</td>
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
                      <td>{new Date(job.timestamp).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="d-flex justify-content-center py-3 border-top border-secondary">
                <nav>
                  <ul className="pagination pagination-sm mb-0">
                    <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                      <button className="page-link bg-dark text-white border-secondary" onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}>Previous</button>
                    </li>
                    <li className="page-item disabled"><span className="page-link bg-dark text-white-50 border-secondary">Page {currentPage} of {totalPages}</span></li>
                    <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                      <button className="page-link bg-dark text-white border-secondary" onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}>Next</button>
                    </li>
                  </ul>
                </nav>
              </div>
            )}
          </div>
        </div>

        {/* Settings Card */}
        <div className="card bg-secondary text-white border-0 shadow-sm">
          <div className="card-header bg-dark text-white border-secondary border-bottom-0 fw-bold">
            ⚙️ System Settings
          </div>
          <div className="card-body">
            <div className="row g-4 align-items-center">
              <div className="col-md-6">
                <label className="form-label fw-bold">Daily Print Limit (pages per user)</label>
                <input type="number" className="form-control bg-dark text-white border-secondary" value={settings.dailyLimit} onChange={(e) => setSettings({ ...settings, dailyLimit: parseInt(e.target.value) })} />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-bold">Allow Personal Printing</label>
                <div className="form-check form-switch">
                  <input className="form-check-input" type="checkbox" id="allowPersonal" checked={settings.allowPersonalPrinting} onChange={(e) => setSettings({ ...settings, allowPersonalPrinting: e.target.checked })} />
                  <label className="form-check-label" htmlFor="allowPersonal">{settings.allowPersonalPrinting ? "Enabled" : "Disabled"}</label>
                </div>
              </div>
            </div>
            <button className="btn btn-primary mt-4" onClick={handleSaveSettings} disabled={savingSettings}>
              {savingSettings ? "Saving..." : "Save Settings"}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}