import { apiClient } from "./client";
import type { AuthResponse, LoginRequest, SignupRequest, User } from "@/types/auth";

export async function login(data: LoginRequest): Promise<AuthResponse> {
  const res = await apiClient.post<AuthResponse>("/auth/login", data);
  return res.data;
}

export async function signup(data: SignupRequest): Promise<AuthResponse> {
  const res = await apiClient.post<AuthResponse>("/auth/signup", data);
  return res.data;
}

export async function getMe(): Promise<User> {
  const res = await apiClient.get<User>("/auth/me");
  return res.data;
}
