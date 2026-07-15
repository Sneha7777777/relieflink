"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Input";

const STATUSES = ["OPEN", "MATCHED", "IN_PROGRESS", "FULFILLED", "CANCELLED"];

export function RequestDetailActions({
  requestId,
  status,
  canEdit,
  isCoordinator,
}: {
  requestId: string;
  status: string;
  canEdit: boolean;
  isCoordinator: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function updateStatus(newStatus: string) {
    setLoading("status");
    setError(null);
    try {
      const res = await fetch(`/api/requests/${requestId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error?.toString?.() ?? "Could not update status.");
        return;
      }
      router.refresh();
    } finally {
      setLoading(null);
    }
  }

  async function runAI(kind: "summarize" | "match") {
    setLoading(kind);
    setError(null);
    try {
      const res = await fetch(`/api/ai/${kind}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error?.toString?.() ?? "AI action failed.");
        return;
      }
      router.refresh();
    } finally {
      setLoading(null);
    }
  }

  async function remove() {
    if (!confirm("Delete this request? This cannot be undone.")) return;
    setLoading("delete");
    try {
      const res = await fetch(`/api/requests/${requestId}`, { method: "DELETE" });
      if (res.ok) router.push("/dashboard/requests");
    } finally {
      setLoading(null);
    }
  }

  if (!canEdit) return null;

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex items-center gap-2">
        <label className="text-sm text-slate-600">Status</label>
        <Select
          value={status}
          onChange={(e) => updateStatus(e.target.value)}
          disabled={loading === "status"}
          className="w-40"
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </Select>
      </div>

      {isCoordinator && (
        <>
          <Button variant="secondary" onClick={() => runAI("summarize")} disabled={!!loading}>
            {loading === "summarize" ? "Re-triaging..." : "Re-run AI triage"}
          </Button>
          <Button variant="secondary" onClick={() => runAI("match")} disabled={!!loading}>
            {loading === "match" ? "Matching..." : "Find AI matches"}
          </Button>
        </>
      )}

      <Button variant="danger" onClick={remove} disabled={!!loading} className="ml-auto">
        {loading === "delete" ? "Deleting..." : "Delete"}
      </Button>

      {error && <p className="w-full text-sm text-red-600">{error}</p>}
    </div>
  );
}
