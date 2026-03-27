import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export function StatCard({ label, value, icon, className }: { label: string; value: string | number; icon?: ReactNode; className?: string }) {
  return (
    <Card className={cn("border-border bg-card", className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">{label}</p>
          {icon && <div className="text-muted-foreground">{icon}</div>}
        </div>
        <p className="mt-2 font-mono text-3xl font-bold text-foreground">{value}</p>
      </CardContent>
    </Card>
  );
}
