import { Navigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

interface PublicRouteProps {
  children: React.ReactNode;
}

export default function PublicRoute({ children }: PublicRouteProps) {
  const { isVerified } = useAuthStore();

  if (isVerified) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
