import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface PickupItem {
  id: string;
  wasteType: string;
  weight: number;
  status: string;
  address: string;
}

interface PickupTableProps {
  pickups: PickupItem[];
}

export function PickupTable({ pickups }: PickupTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Pickup history</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500">
                <th className="pb-3">Waste</th>
                <th className="pb-3">Weight</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">Address</th>
              </tr>
            </thead>
            <tbody>
              {pickups.map((pickup) => (
                <tr key={pickup.id} className="border-b border-slate-100">
                  <td className="py-3 font-medium text-slate-900">{pickup.wasteType}</td>
                  <td className="py-3">{pickup.weight}kg</td>
                  <td className="py-3 text-emerald-600">{pickup.status}</td>
                  <td className="py-3 text-slate-500">{pickup.address}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
