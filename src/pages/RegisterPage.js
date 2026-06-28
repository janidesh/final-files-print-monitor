import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "bootstrap/dist/css/bootstrap.min.css";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();

    if (password !== confirmPassword) {
      return setError("Passwords do not match");
    }
    setError("");
    setLoading(true);

    try {
      await register(email, password);
      navigate("/login");
    } catch (err) {
      setError("Failed to create an account. Email might already be in use.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-dark text-white">
      <div className="card p-4 shadow-lg bg-secondary text-white" style={{ width: "400px", borderRadius: "15px" }}>
        <h2 className="text-center mb-4">📝 Register</h2>
        {error && <div className="alert alert-danger">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="email" className="form-label">Email Address</label>
            <input type="email" id="email" className="form-control" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="mb-3">
            <label htmlFor="password" className="form-label">Password</label>
            <input type="password" id="password" className="form-control" required value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <div className="mb-3">
            <label htmlFor="confirm-password" className="form-label">Confirm Password</label>
            <input type="password" id="confirm-password" className="form-control" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
          </div>
          <button disabled={loading} className="btn btn-primary w-100" type="submit">
            {loading ? "Creating Account..." : "Register"}
          </button>
        </form>
        <div className="mt-3 text-center">
          <Link to="/login" className="text-decoration-none text-info">Already have an account? Login</Link>
        </div>
      </div>
    </div>
  );
}