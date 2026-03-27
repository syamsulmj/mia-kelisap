import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Key, MessageSquare, Settings, Smartphone, Brain, ShieldCheck } from "lucide-react";
import type { UserSettings } from "@/types/settings";

interface Step {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  done: boolean;
  href: string;
}

export function OnboardingGuide({ settings, waStatus }: { settings: UserSettings | undefined; waStatus: string }) {
  const hasKey = settings?.has_openai_key || settings?.has_claude_key;
  const hasPersona = settings ? settings.agent_name !== "Mia" || settings.agent_instructions : false;
  const isConnected = waStatus === "connected";

  const steps: Step[] = [
    {
      id: "api-key",
      label: "Add your LLM API key",
      description: "Go to Settings and add your OpenAI or Claude API key so the AI can respond to messages.",
      icon: <Key size={16} />,
      done: !!hasKey,
      href: "/settings",
    },
    {
      id: "persona",
      label: "Customize your AI agent",
      description: "Give your agent a name, set its tone, and add custom instructions for how it should behave.",
      icon: <Brain size={16} />,
      done: !!hasPersona,
      href: "/settings",
    },
    {
      id: "whatsapp",
      label: "Connect your WhatsApp",
      description: "Scan the QR code below to link your WhatsApp account. Your agent will start responding to messages.",
      icon: <Smartphone size={16} />,
      done: isConnected,
      href: "#whatsapp",
    },
    {
      id: "contacts",
      label: "Set up contact access control",
      description: "Choose who your AI replies to — allowlist trusted contacts or blocklist unknown numbers to save tokens.",
      icon: <ShieldCheck size={16} />,
      done: settings?.contact_access_mode !== "reply_all",
      href: "/settings",
    },
    {
      id: "chat",
      label: "Send a test message",
      description: "Message your WhatsApp from another phone to test the AI replies. Check the Conversations page to see it.",
      icon: <MessageSquare size={16} />,
      done: false,
      href: "/conversations",
    },
  ];

  const completedCount = steps.filter((s) => s.done).length;
  const allDone = completedCount === steps.length;

  if (allDone) return null;

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Getting Started</CardTitle>
          <Badge variant="outline" className="font-mono text-xs">{completedCount}/{steps.length}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          {steps.map((step, i) => (
            <a
              key={step.id}
              href={step.href}
              className="flex items-start gap-3 rounded-md px-3 py-2.5 transition-colors hover:bg-secondary"
            >
              <div className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-mono ${step.done ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"}`}>
                {step.done ? <Settings size={12} className="text-primary" /> : i + 1}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-medium ${step.done ? "text-muted-foreground line-through" : "text-foreground"}`}>{step.label}</span>
                  {step.done && <Badge variant="outline" className="bg-primary/10 text-primary text-[10px] px-1.5 py-0">Done</Badge>}
                </div>
                {!step.done && <p className="mt-0.5 text-xs text-muted-foreground">{step.description}</p>}
              </div>
              <div className="mt-0.5 text-muted-foreground">{step.icon}</div>
            </a>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
