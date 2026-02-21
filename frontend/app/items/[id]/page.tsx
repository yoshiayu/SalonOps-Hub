import { notFound } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getItem } from "@/lib/server/repository";

export default function ItemDetailPage({ params }: { params: { id: string } }) {
  const item = getItem(params.id);
  if (!item) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-white">Item Detail</h2>
        <p className="text-sm text-zinc-400">改善タスクの詳細・履歴・コメント（履歴）</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{item.title}</CardTitle>
          <CardDescription>
            Owner: {item.owner} / Tag: {item.tag}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Badge variant={item.status === "done" ? "success" : item.status === "in_progress" ? "warning" : "outline"}>
              {item.status}
            </Badge>
          </div>
          <div>
            <p className="text-sm text-zinc-400">履歴</p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-zinc-200">
              {item.history.map((entry) => (
                <li key={entry}>{entry}</li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
