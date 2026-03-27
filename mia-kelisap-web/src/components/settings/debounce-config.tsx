import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export function DebounceConfig({ currentValue, onSave, isSaving }: { currentValue: number; onSave: (s: number) => void; isSaving: boolean }) {
  const [value, setValue] = useState(currentValue);

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-3"><CardTitle className="text-base">Message Debounce</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">Wait time (seconds) after the last incoming message before the AI responds.</p>
        <div className="flex items-center gap-3">
          <Label className="shrink-0">Duration</Label>
          <Input
            type="range"
            min={5}
            max={300}
            step={5}
            value={value}
            onChange={(e) => setValue(Number(e.target.value))}
            className="h-2 cursor-pointer border-none bg-transparent p-0 accent-primary"
          />
          <span className="w-12 shrink-0 text-right font-mono text-sm text-primary">{value}s</span>
        </div>
        <div className="flex justify-between font-mono text-xs text-muted-foreground"><span>5s</span><span>300s</span></div>
        <Button onClick={() => onSave(value)} disabled={isSaving || value === currentValue} size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">{isSaving ? "Saving..." : "Update"}</Button>
      </CardContent>
    </Card>
  );
}
