import { apiClient } from "./client";
import type { AnalyticsOverview } from "@/types/analytics";

export async function fetchAnalytics(): Promise<AnalyticsOverview> {
  const res = await apiClient.get<AnalyticsOverview>("/analytics/overview");
  return res.data;
}
