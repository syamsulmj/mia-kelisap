import { apiClient } from "./client";
import type { UpdateSettingsRequest, UserSettings } from "@/types/settings";

export async function fetchSettings(): Promise<UserSettings> {
  const res = await apiClient.get<UserSettings>("/settings");
  return res.data;
}

export async function updateSettings(data: UpdateSettingsRequest): Promise<UserSettings> {
  const res = await apiClient.put<UserSettings>("/settings", data);
  return res.data;
}
