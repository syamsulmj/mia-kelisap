import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownSelect } from "@/components/ui/dropdown-select";
import { Eye, EyeOff, Check } from "lucide-react";
import type { UserSettings, UpdateSettingsRequest } from "@/types/settings";

const openaiModels = [
  { value: "gpt-4o-mini", label: "GPT-4o Mini (cheap)" },
  { value: "gpt-4o", label: "GPT-4o" },
  { value: "gpt-4-turbo", label: "GPT-4 Turbo" },
  { value: "gpt-3.5-turbo", label: "GPT-3.5 Turbo (cheapest)" },
];

const claudeModels = [
  { value: "claude-sonnet-4-6-20250514", label: "Claude Sonnet 4.6" },
  { value: "claude-haiku-4-5-20251001", label: "Claude Haiku 4.5 (cheap)" },
  { value: "claude-opus-4-6-20250610", label: "Claude Opus 4.6" },
];

export function ApiKeyForm({ settings, onSave, isSaving }: { settings: UserSettings; onSave: (d: UpdateSettingsRequest) => void; isSaving: boolean }) {
  const [provider, setProvider] = useState(settings.llm_provider);
  const [model, setModel] = useState(settings.llm_model);
  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);

  const models = provider === "openai" ? openaiModels : claudeModels;
  const hasKey = provider === "openai" ? settings.has_openai_key : settings.has_claude_key;
  const keyPlaceholder = provider === "openai" ? "sk-..." : "sk-ant-...";

  const handleProviderChange = (p: string) => {
    setProvider(p);
    setApiKey("");
    setShowKey(false);
    const firstModel = p === "openai" ? "gpt-4o-mini" : "claude-sonnet-4-6-20250514";
    setModel(firstModel);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data: UpdateSettingsRequest = { llm_provider: provider, llm_model: model };
    if (apiKey) {
      if (provider === "openai") data.openai_api_key = apiKey;
      else data.claude_api_key = apiKey;
    }
    onSave(data);
  };

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-3"><CardTitle className="text-base">LLM Configuration</CardTitle></CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-2">
            <Label>Provider</Label>
            <div className="flex gap-2">
              {(["openai", "claude"] as const).map((p) => (
                <Button key={p} type="button" variant={provider === p ? "default" : "outline"} size="sm" onClick={() => handleProviderChange(p)} className={provider === p ? "bg-primary text-primary-foreground" : ""}>
                  {p === "openai" ? "OpenAI" : "Claude"}
                  {((p === "openai" && settings.has_openai_key) || (p === "claude" && settings.has_claude_key)) && <Check size={14} className="ml-1" />}
                </Button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <Label>Model</Label>
            <DropdownSelect value={model} onValueChange={setModel} options={models} />
            <p className="text-xs text-muted-foreground">Choose a cheaper model to reduce token costs</p>
          </div>
          <div className="space-y-2">
            <Label>{provider === "openai" ? "OpenAI" : "Claude"} API Key</Label>
            <div className="relative">
              <Input type={showKey ? "text" : "password"} placeholder={hasKey ? "Key saved — enter new to replace" : keyPlaceholder} value={apiKey} onChange={(e) => setApiKey(e.target.value)} className="border-input bg-background pr-10 font-mono text-sm" />
              <button type="button" onClick={() => setShowKey(!showKey)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">{showKey ? <EyeOff size={14} /> : <Eye size={14} />}</button>
            </div>
          </div>
          <Button type="submit" disabled={isSaving} size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">{isSaving ? "Saving..." : "Save Configuration"}</Button>
        </form>
      </CardContent>
    </Card>
  );
}
