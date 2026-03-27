import { RootLayout } from "@/components/layout/root-layout";
import { PageHeader } from "@/components/layout/page-header";
import { ApiKeyForm } from "@/components/settings/api-key-form";
import { DebounceConfig } from "@/components/settings/debounce-config";
import { AgentPersonaForm } from "@/components/settings/agent-persona-form";
import { ContactAccessControl } from "@/components/settings/contact-access-control";
import { QrScanner } from "@/components/whatsapp/qr-scanner";
import { useSettings, useUpdateSettings } from "@/hooks/use-settings";
import { useWhatsAppStatus, useConnectWhatsApp, useDisconnectWhatsApp } from "@/hooks/use-whatsapp";

export function SettingsPage() {
  const { data: settings } = useSettings();
  const update = useUpdateSettings();
  const { data: wa } = useWhatsAppStatus();
  const connect = useConnectWhatsApp();
  const disconnect = useDisconnectWhatsApp();

  if (!settings) return null;

  return (
    <RootLayout>
      <PageHeader title="Settings" description="Configure your MIA instance" />
      <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
        {/* Left column */}
        <div className="space-y-4">
          <div className="animate-fade-up">
            <QrScanner status={wa?.status ?? "disconnected"} qrCode={wa?.qr_code ?? null} onConnect={() => connect.mutate()} onDisconnect={() => disconnect.mutate()} isConnecting={connect.isPending} />
          </div>
          <div className="animate-fade-up" style={{ animationDelay: "50ms" }}>
            <ApiKeyForm settings={settings} onSave={(d) => update.mutate(d)} isSaving={update.isPending} />
          </div>
          <div className="animate-fade-up" style={{ animationDelay: "100ms" }}>
            <DebounceConfig currentValue={settings.debounce_seconds} onSave={(s) => update.mutate({ debounce_seconds: s })} isSaving={update.isPending} />
          </div>
          <div className="animate-fade-up" style={{ animationDelay: "150ms" }}>
            <ContactAccessControl settings={settings} onSave={(d) => update.mutate(d)} isSaving={update.isPending} />
          </div>
        </div>
        {/* Right column */}
        <div className="space-y-4">
          <div className="animate-fade-up" style={{ animationDelay: "50ms" }}>
            <AgentPersonaForm settings={settings} onSave={(d) => update.mutate(d)} isSaving={update.isPending} />
          </div>
        </div>
      </div>
    </RootLayout>
  );
}
