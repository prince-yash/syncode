import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../providers/useAuth";

export function ProtectedRoute() {
  const { status, refresh } = useAuth();
  const location = useLocation();

  if (status === "loading") {
    return (
      <main className="auth-page" aria-live="polite">
        Checking your session…
      </main>
    );
  }

  if (status === "unavailable") {
    return (
      <main className="auth-page" role="alert">
        <p>Syncode could not verify your session.</p>
        <button
          type="button"
          className="text-button"
          onClick={() => void refresh()}
        >
          Try again
        </button>
      </main>
    );
  }

  if (status === "unauthenticated") {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}
