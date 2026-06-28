import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState, useEffect } from "react";
import { db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";

export default function ProtectedRoute({ children, adminOnly = false }) {
  const { user, loading } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingRole, setCheckingRole] = useState(adminOnly);

  useEffect(() => {
    if (adminOnly && user) {
      const checkAdminRole = async () => {
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            setIsAdmin(data.role === "admin");
          }
        } catch (error) {
          console.error("Error checking admin role:", error);
        } finally {
          setCheckingRole(false);
        }
      };
      checkAdminRole();
    } else {
      setCheckingRole(false);
    }
  }, [adminOnly, user]);

  if (loading || checkingRole) return <div className="text-center text-white mt-5">Loading...</div>;

  if (!user) return <Navigate to="/login" replace />;

  if (adminOnly && !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}