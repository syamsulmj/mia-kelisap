import { useAuthStore } from "@/stores/auth-store";
import { LoginPage } from "@/pages/login";
import { SignupPage } from "@/pages/signup";
import { DashboardPage } from "@/pages/dashboard";
import { ConversationsPage } from "@/pages/conversations";
import { MemoryPage } from "@/pages/memory";
import { SettingsPage } from "@/pages/settings";
import { AnalyticsPage } from "@/pages/analytics";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = useAuthStore((s) => s.token);
  if (!token) {
    window.location.href = "/login";
    return null;
  }
  return <>{children}</>;
}

export function AppRouter() {
  const path = window.location.pathname;

  if (path === "/login") return <LoginPage />;
  if (path === "/signup") return <SignupPage />;

  return (
    <ProtectedRoute>
      {path === "/conversations" ? <ConversationsPage />
        : path === "/memory" ? <MemoryPage />
        : path === "/settings" ? <SettingsPage />
        : path === "/analytics" ? <AnalyticsPage />
        : <DashboardPage />}
    </ProtectedRoute>
  );
}
