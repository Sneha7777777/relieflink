"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input, Textarea, Select } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

const CATEGORIES = ["FOOD", "WATER", "SHELTER", "MEDICAL", "CLOTHING", "TRANSPORT", "RESCUE", "OTHER"];

export function RequestForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const form = new FormData(e.currentTarget);
    const payload = {
      title: form.get("title"),
      description: form.get("description"),
      category: form.get("category"),
      headcount: Number(form.get("headcount")),
      location: form.get("location"),
    };

    try {
      const res = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(typeof data.error === "string" ? data.error : "Could not submit request.");
        return;
      }
      router.push(`/dashboard/requests/${data.request.id}`);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">Title</label>
        <Input name="title" required maxLength={120} placeholder="e.g. Family of 4 needs shelter" />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">Description</label>
        <Textarea
          name="description"
          required
          maxLength={4000}
          rows={4}
          placeholder="Describe the situation: who's affected, any immediate risks, and what you need."
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Category</label>
          <Select name="category" required defaultValue="SHELTER">
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">People affected</label>
          <Input name="headcount" type="number" min={1} max={10000} defaultValue={1} required />
        </div>
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">Location</label>
        <Input name="location" required maxLength={200} placeholder="Neighborhood, city, or address" />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <Button type="submit" disabled={loading}>
        {loading ? "Submitting..." : "Submit request"}
      </Button>
      <p className="text-xs text-slate-400">
        Your request will be automatically triaged for urgency by AI, then reviewed by a coordinator.
      </p>
    </form>
  );
}
