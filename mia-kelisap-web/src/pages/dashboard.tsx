import { RootLayout } from "@/components/layout/root-layout";
import { PageHeader } from "@/components/layout/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { QrScanner } from "@/components/whatsapp/qr-scanner";
import { OnboardingGuide } from "@/components/dashboard/onboarding-guide";
import { useAuthStore } from "@/stores/auth-store";
import { useWhatsAppStatus, useConnectWhatsApp, useDisconnectWhatsApp } from "@/hooks/use-whatsapp";
import { useAnalytics } from "@/hooks/use-analytics";
import { useSettings } from "@/hooks/use-settings";
import { MessageSquare, Brain, BarChart3, Zap } from "lucide-react";

export function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const { data: wa } = useWhatsAppStatus();
  const { data: analytics } = useAnalytics();
  const { data: settings } = useSettings();
  const connect = useConnectWhatsApp();
  const disconnect = useDisconnectWhatsApp();

  const stats = [
    { label: "Conversations", value: analytics?.total_conversations ?? 0, icon: <MessageSquare size={18} /> },
    { label: "Messages", value: analytics?.total_messages ?? 0, icon: <Zap size={18} /> },
    { label: "Memories", value: analytics?.total_memories ?? 0, icon: <Brain size={18} /> },
    { label: "This Week", value: analytics?.messages_this_week ?? 0, icon: <BarChart3 size={18} /> },
  ];

  return (
    <RootLayout>
      <PageHeader title="Dashboard" description={`Welcome back, ${user?.name || user?.email || "there"}`} />
      <div className="space-y-4">
        {/* Onboarding */}
        <div className="animate-fade-up">
          <OnboardingGuide settings={settings} waStatus={wa?.status ?? "disconnected"} />
        </div>

        {/* Stats */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s, i) => (
            <div key={s.label} className="animate-fade-up" style={{ animationDelay: `${(i + 1) * 50}ms` }}>
              <StatCard {...s} />
            </div>
          ))}
        </div>

        {/* WhatsApp */}
        <div id="whatsapp" className="animate-fade-up" style={{ animationDelay: "300ms" }}>
          <QrScanner status={wa?.status ?? "disconnected"} qrCode={wa?.qr_code ?? null} onConnect={() => connect.mutate()} onDisconnect={() => disconnect.mutate()} isConnecting={connect.isPending} />
        </div>
      </div>
    </RootLayout>
  );
}
