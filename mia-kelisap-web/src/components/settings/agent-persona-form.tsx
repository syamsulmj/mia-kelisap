import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownSelect } from "@/components/ui/dropdown-select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import type { UserSettings, UpdateSettingsRequest } from "@/types/settings";

const toneOptions = [
  { value: "professional", label: "Professional" },
  { value: "casual", label: "Casual" },
  { value: "friendly", label: "Friendly" },
  { value: "formal", label: "Formal" },
  { value: "witty", label: "Witty" },
  { value: "empathetic", label: "Empathetic" },
];

const lengthOptions = [
  { value: "short", label: "Short (1-2 sentences)" },
  { value: "medium", label: "Medium (paragraph)" },
  { value: "detailed", label: "Detailed" },
];

export function AgentPersonaForm({ settings, onSave, isSaving }: { settings: UserSettings; onSave: (d: UpdateSettingsRequest) => void; isSaving: boolean }) {
  const [name, setName] = useState(settings.agent_name);
  const [tone, setTone] = useState(settings.agent_tone);
  const [instructions, setInstructions] = useState(settings.agent_instructions ?? "");
  const [responseLength, setResponseLength] = useState(settings.response_length);
  const [avoidMarkdown, setAvoidMarkdown] = useState(settings.avoid_markdown);
  const [useSimpleLanguage, setUseSimpleLanguage] = useState(settings.use_simple_language);
  const [avoidOversharing, setAvoidOversharing] = useState(settings.avoid_oversharing);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      agent_name: name,
      agent_tone: tone,
      agent_instructions: instructions || undefined,
      response_length: responseLength,
      avoid_markdown: avoidMarkdown,
      use_simple_language: useSimpleLanguage,
      avoid_oversharing: avoidOversharing,
    });
  };

  return (
    <Card className="border-border bg-card">
      <CardHeader><CardTitle className="text-base">AI Agent Persona</CardTitle></CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Agent Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Mia" className="border-input bg-background" />
            <p className="text-xs text-muted-foreground">The name your AI assistant introduces itself as</p>
          </div>
          <div className="space-y-2">
            <Label>Tone</Label>
            <DropdownSelect value={tone} onValueChange={setTone} options={toneOptions} />
          </div>
          <div className="space-y-2">
            <Label>Custom Instructions</Label>
            <textarea value={instructions} onChange={(e) => setInstructions(e.target.value)} placeholder="Add any specific behavior, knowledge, or personality traits..." rows={4} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
            <p className="text-xs text-muted-foreground">Detailed instructions for how your agent should behave and respond</p>
          </div>

          <Separator />
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Reply Style</p>

          <div className="space-y-2">
            <Label>Response Length</Label>
            <DropdownSelect value={responseLength} onValueChange={setResponseLength} options={lengthOptions} />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <Label>Avoid markdown formatting</Label>
                <p className="text-xs text-muted-foreground">Plain text only, no bold/headers/bullets</p>
              </div>
              <Switch checked={avoidMarkdown} onCheckedChange={setAvoidMarkdown} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Use simple language</Label>
                <p className="text-xs text-muted-foreground">Avoid jargon and technical terms</p>
              </div>
              <Switch checked={useSimpleLanguage} onCheckedChange={setUseSimpleLanguage} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Avoid over-sharing</Label>
                <p className="text-xs text-muted-foreground">Only share directly relevant information</p>
              </div>
              <Switch checked={avoidOversharing} onCheckedChange={setAvoidOversharing} />
            </div>
          </div>

          <Button type="submit" disabled={isSaving} className="bg-primary text-primary-foreground hover:bg-primary/90">{isSaving ? "Saving..." : "Save Persona"}</Button>
        </form>
      </CardContent>
    </Card>
  );
}
