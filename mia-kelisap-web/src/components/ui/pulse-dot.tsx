import { cn } from "@/lib/utils";

const statusColors = {
  connected: "bg-green-500",
  connecting: "bg-yellow-500",
  qr_pending: "bg-yellow-500",
  disconnected: "bg-red-500",
};

export function PulseDot({ status, className }: { status: keyof typeof statusColors; className?: string }) {
  return (
    <span className={cn("relative flex h-2.5 w-2.5", className)}>
      <span className={cn("absolute inline-flex h-full w-full rounded-full opacity-75", statusColors[status], status !== "disconnected" && "animate-pulse-dot")} />
      <span className={cn("relative inline-flex h-2.5 w-2.5 rounded-full", statusColors[status])} />
    </span>
  );
}
