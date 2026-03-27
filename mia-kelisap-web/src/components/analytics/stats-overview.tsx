import { StatCard } from "@/components/ui/stat-card";
import { MessageSquare, Brain, BarChart3, Zap } from "lucide-react";
import type { AnalyticsOverview } from "@/types/analytics";

export function StatsOverview({ data }: { data: AnalyticsOverview }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard label="Total Conversations" value={data.total_conversations} icon={<MessageSquare size={18} />} />
      <StatCard label="Total Messages" value={data.total_messages} icon={<Zap size={18} />} />
      <StatCard label="Memories Stored" value={data.total_memories} icon={<Brain size={18} />} />
      <StatCard label="Messages This Week" value={data.messages_this_week} icon={<BarChart3 size={18} />} />
    </div>
  );
}
