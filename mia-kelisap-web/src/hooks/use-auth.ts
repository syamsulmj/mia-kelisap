import { useMutation, useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/auth-store";
import * as authApi from "@/api/auth";
import type { LoginRequest, SignupRequest } from "@/types/auth";

export function useUser() {
  const token = useAuthStore((s) => s.token);
  return useQuery({ queryKey: ["user", "me"], queryFn: authApi.getMe, enabled: !!token });
}

export function useLogin() {
  const setAuth = useAuthStore((s) => s.setAuth);
  return useMutation({
    mutationFn: async (data: LoginRequest) => {
      const auth = await authApi.login(data);
      // Store token first so the interceptor can use it for getMe
      useAuthStore.getState().setAuth(auth.access_token, { id: "", email: data.email, name: "" });
      const user = await authApi.getMe();
      setAuth(auth.access_token, user);
      return user;
    },
  });
}

export function useSignup() {
  const setAuth = useAuthStore((s) => s.setAuth);
  return useMutation({
    mutationFn: async (data: SignupRequest) => {
      const auth = await authApi.signup(data);
      useAuthStore.getState().setAuth(auth.access_token, { id: "", email: data.email, name: data.name });
      const user = await authApi.getMe();
      setAuth(auth.access_token, user);
      return user;
    },
  });
}
