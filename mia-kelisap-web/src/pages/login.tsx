import { AuthLayout } from "@/components/layout/auth-layout";
import { LoginForm } from "@/components/auth/login-form";

export function LoginPage() {
  return <AuthLayout><div className="animate-fade-up"><LoginForm /></div></AuthLayout>;
}
