import { RootLayout } from "@/components/layout/root-layout";
import { PageHeader } from "@/components/layout/page-header";
import { StatsOverview } from "@/components/analytics/stats-overview";
import { useAnalytics } from "@/hooks/use-analytics";

export function AnalyticsPage() {
  const { data } = useAnalytics();
  return (
    <RootLayout>
      <PageHeader title="Analytics" description="Insights into your WhatsApp memory bot" />
      {data && <div className="animate-fade-up"><StatsOverview data={data} /></div>}
    </RootLayout>
  );
}
