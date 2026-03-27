import { apiClient } from "./client";

interface WhatsAppStatus {
  status: string;
  qr_code: string | null;
}

interface ConnectResponse {
  status: string;
  message: string;
}

export async function getWhatsAppStatus(): Promise<WhatsAppStatus> {
  const res = await apiClient.get<WhatsAppStatus>("/whatsapp/status");
  return res.data;
}

export async function connectWhatsApp(): Promise<ConnectResponse> {
  const res = await apiClient.post<ConnectResponse>("/whatsapp/connect");
  return res.data;
}

export async function disconnectWhatsApp(): Promise<ConnectResponse> {
  const res = await apiClient.post<ConnectResponse>("/whatsapp/disconnect");
  return res.data;
}
