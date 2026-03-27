import { PulseDot } from "@/components/ui/pulse-dot";

const labels: Record<string, string> = { connected: "Connected", connecting: "Connecting...", qr_pending: "Scan QR Code", disconnected: "Disconnected" };

export function ConnectionStatus({ status }: { status: string }) {
  const s = (status as "connected" | "connecting" | "qr_pending" | "disconnected") || "disconnected";
  return (
    <div className="flex items-center gap-2">
      <PulseDot status={s} />
      <span className="text-sm text-foreground">{labels[s] ?? "Unknown"}</span>
    </div>
  );
}
