import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ConnectionStatus } from "./connection-status";
import { Smartphone, ScanLine, Wifi, WifiOff, RefreshCw } from "lucide-react";

export function QrScanner({ status, qrCode, onConnect, onDisconnect, isConnecting }: { status: string; qrCode: string | null; onConnect: () => void; onDisconnect: () => void; isConnecting: boolean }) {
  const isQrReady = qrCode && status === "qr_pending";
  const isConnected = status === "connected";
  const isConnecting_ = status === "connecting" || isConnecting;

  return (
    <Card className="border-border bg-card">
      <CardContent className="p-6">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isConnected ? <Wifi size={16} className="text-primary" /> : <WifiOff size={16} className="text-muted-foreground" />}
            <h3 className="text-sm font-medium text-foreground">WhatsApp</h3>
          </div>
          <ConnectionStatus status={status} />
        </div>

        {/* Connected state */}
        {isConnected && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 rounded-lg border border-primary/20 bg-primary/5 p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/15">
                <Smartphone size={18} className="text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">WhatsApp is connected</p>
                <p className="text-xs text-muted-foreground">Your AI companion is actively responding to messages.</p>
              </div>
            </div>
            <Button onClick={onDisconnect} variant="outline" size="sm" className="border-destructive/40 text-destructive hover:bg-destructive/10">
              <WifiOff size={14} className="mr-1.5" />
              Disconnect
            </Button>
          </div>
        )}

        {/* QR Code state */}
        {isQrReady && (
          <div className="space-y-4">
            {/* QR Code with decorative frame */}
            <div className="relative mx-auto w-fit">
              <div className="rounded-xl border border-border bg-white p-3 shadow-lg shadow-black/20">
                <img src={qrCode} alt="WhatsApp QR Code" className="h-52 w-52" />
              </div>
              {/* Scan animation overlay */}
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <div className="absolute left-2 top-2 h-5 w-5 rounded-tl-lg border-l-2 border-t-2 border-primary" />
                <div className="absolute right-2 top-2 h-5 w-5 rounded-tr-lg border-r-2 border-t-2 border-primary" />
                <div className="absolute bottom-2 left-2 h-5 w-5 rounded-bl-lg border-b-2 border-l-2 border-primary" />
                <div className="absolute bottom-2 right-2 h-5 w-5 rounded-br-lg border-b-2 border-r-2 border-primary" />
              </div>
            </div>

            {/* Instructions */}
            <div className="space-y-2.5 rounded-lg border border-border bg-secondary/50 p-4">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">How to connect</p>
              <ol className="space-y-2 text-sm text-foreground">
                <li className="flex gap-2.5">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/15 font-mono text-[10px] font-bold text-primary">1</span>
                  <span>Open <strong className="text-foreground">WhatsApp</strong> on your phone</span>
                </li>
                <li className="flex gap-2.5">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/15 font-mono text-[10px] font-bold text-primary">2</span>
                  <span>Go to <strong className="text-foreground">Settings &gt; Linked Devices</strong></span>
                </li>
                <li className="flex gap-2.5">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/15 font-mono text-[10px] font-bold text-primary">3</span>
                  <span>Tap <strong className="text-foreground">Link a Device</strong> and scan this QR code</span>
                </li>
              </ol>
            </div>

            <p className="text-center text-xs text-muted-foreground">
              <ScanLine size={12} className="mr-1 inline" />
              QR code refreshes automatically. Keep this page open while scanning.
            </p>
          </div>
        )}

        {/* Disconnected state */}
        {status === "disconnected" && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 rounded-lg border border-border bg-secondary/30 p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted">
                <Smartphone size={18} className="text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Not connected</p>
                <p className="text-xs text-muted-foreground">Connect your WhatsApp to start receiving and replying to messages with AI.</p>
              </div>
            </div>
            <Button onClick={onConnect} disabled={isConnecting_} className="bg-primary text-primary-foreground hover:bg-primary/90">
              {isConnecting_ ? <><RefreshCw size={14} className="mr-1.5 animate-spin" /> Connecting...</> : <><Smartphone size={14} className="mr-1.5" /> Connect WhatsApp</>}
            </Button>
          </div>
        )}

        {/* Connecting state (no QR yet) */}
        {isConnecting_ && !isQrReady && status !== "disconnected" && (
          <div className="flex items-center gap-3 rounded-lg border border-border bg-secondary/30 p-4">
            <RefreshCw size={18} className="animate-spin text-primary" />
            <div>
              <p className="text-sm font-medium text-foreground">Connecting to WhatsApp...</p>
              <p className="text-xs text-muted-foreground">Generating QR code, please wait a moment.</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
