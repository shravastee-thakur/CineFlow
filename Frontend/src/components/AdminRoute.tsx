import { Navigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

interface AdminRouteProps {
  children: React.ReactNode;
}

export default function AdminRoute({ children }: AdminRouteProps) {
  const { isVerified, role } = useAuthStore();

  if (!isVerified) {
    return <Navigate to="/login" replace />;
  }

  if (role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
