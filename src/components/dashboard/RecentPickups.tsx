import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const pickups = [
  { id: 1, type: "Plastic", weight: "8kg", status: "Completed", date: "Today" },
  { id: 2, type: "Paper", weight: "15kg", status: "Pending", date: "Tomorrow" },
  { id: 3, type: "Metal", weight: "5kg", status: "Accepted", date: "Aug 2" },
];

export function RecentPickups() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent pickups</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {pickups.map((pickup) => (
            <div key={pickup.id} className="flex items-center justify-between rounded-xl border border-slate-200 p-4">
              <div>
                <p className="font-semibold text-slate-900">{pickup.type}</p>
                <p className="text-sm text-slate-500">{pickup.date}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-slate-900">{pickup.weight}</p>
                <p className="text-sm text-emerald-600">{pickup.status}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
