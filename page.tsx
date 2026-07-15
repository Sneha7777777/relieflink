import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, Badge } from "@/components/ui/Card";
import { urgencyColor } from "@/lib/utils";
import { AIAssistantWidget } from "@/components/AIAssistantWidget";

export default async function DashboardPage() {
  const session = await auth();
  const role = session!.user.role;

  const [openRequests, myRequests, myOffers] = await Promise.all([
    role !== "REQUESTER"
      ? prisma.helpRequest.findMany({
          where: { status: "OPEN" },
          orderBy: [{ urgency: "desc" }, { createdAt: "desc" }],
          take: 5,
        })
      : Promise.resolve([]),
    role === "REQUESTER"
      ? prisma.helpRequest.findMany({ where: { requesterId: session!.user.id }, orderBy: { createdAt: "desc" }, take: 5 })
      : Promise.resolve([]),
    role === "VOLUNTEER"
      ? prisma.resourceOffer.findMany({ where: { volunteerId: session!.user.id }, orderBy: { createdAt: "desc" }, take: 5 })
      : Promise.resolve([]),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold text-slate-900">
          Welcome back, {session!.user.name?.split(" ")[0]}
        </h1>
        <div className="flex gap-2">
          {role !== "VOLUNTEER" && (
            <Link href="/dashboard/requests" className="text-sm font-medium text-brand-600 hover:underline">
              {role === "REQUESTER" ? "New request →" : "View all requests →"}
            </Link>
          )}
          {role !== "REQUESTER" && (
            <Link href="/dashboard/resources" className="text-sm font-medium text-brand-600 hover:underline">
              {role === "VOLUNTEER" ? "New offer →" : "View all offers →"}
            </Link>
          )}
        </div>
      </div>

      {role === "REQUESTER" && (
        <section>
          <h2 className="mb-3 text-lg font-medium text-slate-800">Your requests</h2>
          {myRequests.length === 0 ? (
            <Card className="text-sm text-slate-500">
              You haven&apos;t posted a request yet.{" "}
              <Link href="/dashboard/requests" className="text-brand-600 hover:underline">
                Post one now
              </Link>
              .
            </Card>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {myRequests.map((r) => (
                <Link key={r.id} href={`/dashboard/requests/${r.id}`}>
                  <Card className="hover:border-brand-300 transition-colors">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-medium text-slate-900">{r.title}</h3>
                      <Badge className={urgencyColor[r.urgency]}>{r.urgency}</Badge>
                    </div>
                    <p className="mt-1 text-xs text-slate-500">Status: {r.status}</p>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </section>
      )}

      {role === "VOLUNTEER" && (
        <section>
          <h2 className="mb-3 text-lg font-medium text-slate-800">Your offers</h2>
          {myOffers.length === 0 ? (
            <Card className="text-sm text-slate-500">
              You haven&apos;t posted an offer yet.{" "}
              <Link href="/dashboard/resources" className="text-brand-600 hover:underline">
                Post one now
              </Link>
              .
            </Card>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {myOffers.map((o) => (
                <Card key={o.id}>
                  <h3 className="font-medium text-slate-900">{o.title}</h3>
                  <p className="mt-1 text-xs text-slate-500">
                    {o.category} · qty {o.quantity} · {o.available ? "available" : "unavailable"}
                  </p>
                </Card>
              ))}
            </div>
          )}
        </section>
      )}

      {role !== "REQUESTER" && (
        <section>
          <h2 className="mb-3 text-lg font-medium text-slate-800">Highest-urgency open requests</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {openRequests.map((r) => (
              <Link key={r.id} href={`/dashboard/requests/${r.id}`}>
                <Card className="hover:border-brand-300 transition-colors">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-medium text-slate-900">{r.title}</h3>
                    <Badge className={urgencyColor[r.urgency]}>{r.urgency}</Badge>
                  </div>
                  <p className="mt-1 text-xs text-slate-500 line-clamp-2">{r.aiSummary ?? r.description}</p>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}

      <AIAssistantWidget />
    </div>
  );
}
