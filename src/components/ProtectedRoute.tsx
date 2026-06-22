import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Spinner } from "./Spinner";

export function ProtectedRoute() {
  const { status } = useAuth();

  // Mientras /auth/me responde, no decidimos todavía (evita parpadeo al login).
  if (status === "loading") {
    return (
      <div className="grid min-h-screen place-items-center">
        <Spinner label="Restaurando sesión..." />
      </div>
    );
  }

  if (status === "unauthenticated") {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
