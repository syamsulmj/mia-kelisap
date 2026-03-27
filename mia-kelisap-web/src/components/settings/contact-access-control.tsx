import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useContactRules, useCreateContactRule, useDeleteContactRule } from "@/hooks/use-contacts";
import { X, Plus, ShieldCheck, ShieldOff, Globe } from "lucide-react";
import type { UserSettings, UpdateSettingsRequest } from "@/types/settings";

const modes = [
  { value: "reply_all", label: "Reply All", icon: <Globe size={14} />, desc: "Reply to everyone" },
  { value: "allowlist", label: "Allowlist", icon: <ShieldCheck size={14} />, desc: "Only approved contacts" },
  { value: "blocklist", label: "Blocklist", icon: <ShieldOff size={14} />, desc: "Block specific contacts" },
] as const;

export function ContactAccessControl({ settings, onSave, isSaving }: { settings: UserSettings; onSave: (d: UpdateSettingsRequest) => void; isSaving: boolean }) {
  const { data: rulesData } = useContactRules();
  const createRule = useCreateContactRule();
  const deleteRule = useDeleteContactRule();
  const [jid, setJid] = useState("");
  const [contactName, setContactName] = useState("");

  const mode = settings.contact_access_mode;
  const rules = rulesData?.rules ?? [];
  const showList = mode === "allowlist" || mode === "blocklist";
  const ruleType = mode === "allowlist" ? "allow" as const : "block" as const;

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!jid.trim()) return;
    const normalizedJid = jid.includes("@") ? jid.trim() : `${jid.trim()}@s.whatsapp.net`;
    createRule.mutate({ contact_jid: normalizedJid, rule_type: ruleType, contact_name: contactName.trim() || undefined });
    setJid("");
    setContactName("");
  };

  return (
    <Card className="border-border bg-card">
      <CardHeader><CardTitle className="text-base">Contact Access Control</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">Control who your AI companion replies to. Blocked contacts won't trigger LLM calls, saving your tokens.</p>

        <div className="flex gap-2">
          {modes.map((m) => (
            <Button
              key={m.value}
              type="button"
              variant={mode === m.value ? "default" : "outline"}
              size="sm"
              onClick={() => onSave({ contact_access_mode: m.value })}
              disabled={isSaving}
              className={mode === m.value ? "bg-primary text-primary-foreground" : ""}
            >
              {m.icon}
              <span className="ml-1">{m.label}</span>
            </Button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">
          {modes.find((m) => m.value === mode)?.desc}
        </p>

        {showList && (
          <>
            <form onSubmit={handleAdd} className="flex gap-2">
              <Input value={jid} onChange={(e) => setJid(e.target.value)} placeholder="Phone number or JID" className="flex-1 border-input bg-background font-mono text-sm" />
              <Input value={contactName} onChange={(e) => setContactName(e.target.value)} placeholder="Name (optional)" className="w-36 border-input bg-background text-sm" />
              <Button type="submit" size="icon" disabled={!jid.trim() || createRule.isPending} className="bg-primary text-primary-foreground hover:bg-primary/90">
                <Plus size={16} />
              </Button>
            </form>

            {rules.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">
                No contacts added yet. Add a phone number above.
              </p>
            ) : (
              <div className="space-y-2">
                {rules.map((rule) => (
                  <div key={rule.id} className="flex items-center justify-between rounded-md border border-border bg-background px-3 py-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        {rule.contact_name && <span className="text-sm text-foreground">{rule.contact_name}</span>}
                        <span className="truncate font-mono text-xs text-muted-foreground">{rule.contact_jid}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={rule.rule_type === "allow" ? "default" : "destructive"} className={rule.rule_type === "allow" ? "bg-green-500/20 text-green-400" : ""}>
                        {rule.rule_type}
                      </Badge>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => deleteRule.mutate(rule.id)}>
                        <X size={14} />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <Label className="text-xs text-muted-foreground">
              {mode === "allowlist"
                ? "Only contacts in this list will receive AI replies."
                : "Contacts in this list will be blocked from receiving AI replies."}
            </Label>
          </>
        )}
      </CardContent>
    </Card>
  );
}
