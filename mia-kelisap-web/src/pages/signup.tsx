import { AuthLayout } from "@/components/layout/auth-layout";
import { SignupForm } from "@/components/auth/signup-form";

export function SignupPage() {
  return <AuthLayout><div className="animate-fade-up"><SignupForm /></div></AuthLayout>;
}
