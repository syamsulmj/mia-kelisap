import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { connectWhatsApp, disconnectWhatsApp, getWhatsAppStatus } from "@/api/whatsapp";

export function useWhatsAppStatus() {
  return useQuery({ queryKey: ["whatsapp", "status"], queryFn: getWhatsAppStatus, refetchInterval: 5000 });
}

export function useConnectWhatsApp() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: connectWhatsApp,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["whatsapp"] }),
  });
}

export function useDisconnectWhatsApp() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: disconnectWhatsApp,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["whatsapp"] }),
  });
}
