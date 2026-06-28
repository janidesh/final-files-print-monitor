import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import PrintPage from "./pages/PrintPage";
import AdminDashboard from "./pages/AdminDashboard";

function App() {
  return (
    // ✅ Add basename="/projects/ouspms" here. This tells React Router:
    // "Ignore the /projects/ouspms part, and treat the rest as normal routes!"
    <BrowserRouter basename="/projects/ouspms">
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          
          {/* Protected Routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          } />
          <Route path="/print" element={
            <ProtectedRoute>
              <PrintPage />
            </ProtectedRoute>
          } />
          
          {/* Admin Route */}
          <Route path="/admin" element={
            <ProtectedRoute adminOnly={true}>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          
          {/* ✅ Root redirect - now "/" will perfectly redirect to "/dashboard" */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;