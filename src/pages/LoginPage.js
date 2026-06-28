import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "bootstrap/dist/css/bootstrap.min.css";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err) {
      setError("Failed to log in. Please check your email and password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-dark text-white">
      <div className="card p-4 shadow-lg bg-secondary text-white" style={{ width: "400px", borderRadius: "15px" }}>
        <h2 className="text-center mb-4">🖨️ OUSPMS Login</h2>
        {error && <div className="alert alert-danger">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="email" className="form-label">Email Address</label>
            <input
              type="email" id="email" className="form-control" required
              value={email} onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="mb-3">
            <label htmlFor="password" className="form-label">Password</label>
            <input
              type="password" id="password" className="form-control" required
              value={password} onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button disabled={loading} className="btn btn-primary w-100" type="submit">
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
        <div className="mt-3 text-center">
          <Link to="/register" className="text-decoration-none text-info">Don't have an account? Register</Link>
        </div>
      </div>
    </div>
  );
}