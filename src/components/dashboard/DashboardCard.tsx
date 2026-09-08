import { Card, CardContent } from "@/components/ui/card";

interface DashboardCardProps {
  title: string;
  value: string;
  detail: string;
  accent: string;
}

export function DashboardCard({ title, value, detail, accent }: DashboardCardProps) {
  return (
    <Card className={`border-0 ${accent}`}>
      <CardContent className="p-5">
        <p className="text-sm font-medium text-slate-600">{title}</p>
        <h3 className="mt-3 text-3xl font-semibold text-slate-900">{value}</h3>
        <p className="mt-2 text-sm text-slate-500">{detail}</p>
      </CardContent>
    </Card>
  );
}
