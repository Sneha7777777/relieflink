"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Input";

type Msg = { role: "user" | "assistant"; content: string };

export function AIAssistantWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  async function send() {
    if (!input.trim() || loading) return;
    const outgoing = input.trim();
    const next = [...messages, { role: "user" as const, content: outgoing }];
    setMessages(next);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/ai/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: outgoing, history: messages.slice(-10) }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessages((m) => [...m, { role: "assistant", content: data.reply }]);
      } else {
        setMessages((m) => [...m, { role: "assistant", content: `Error: ${data.error ?? "please try again."}` }]);
      }
    } catch {
      setMessages((m) => [...m, { role: "assistant", content: "Network error. Please try again." }]);
    } finally {
      setLoading(false);
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-5 right-5 rounded-full bg-brand-600 text-white px-4 py-3 text-sm font-medium shadow-lg hover:bg-brand-700"
        aria-label="Open AI assistant"
      >
        Ask ReliefLink AI
      </button>
    );
  }

  return (
    <div className="fixed bottom-5 right-5 w-80 sm:w-96 rounded-xl border border-slate-200 bg-white shadow-xl flex flex-col max-h-[28rem]">
      <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
        <h3 className="text-sm font-semibold text-slate-900">ReliefLink Assistant</h3>
        <button onClick={() => setOpen(false)} aria-label="Close assistant" className="text-slate-400 hover:text-slate-600">
          ✕
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2 text-sm">
        {messages.length === 0 && (
          <p className="text-slate-400">
            Ask about prioritization, logistics, or drafting a message to a requester or volunteer.
          </p>
        )}
        {messages.map((m, i) => (
          <div
            key={i}
            className={m.role === "user" ? "text-right" : "text-left"}
          >
            <span
              className={
                m.role === "user"
                  ? "inline-block rounded-xl bg-brand-600 text-white px-3 py-1.5 max-w-[85%]"
                  : "inline-block rounded-xl bg-slate-100 text-slate-800 px-3 py-1.5 max-w-[85%]"
              }
            >
              {m.content}
            </span>
          </div>
        ))}
        {loading && <p className="text-slate-400">Thinking…</p>}
      </div>

      <div className="border-t border-slate-200 p-3 flex gap-2">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
          rows={1}
          placeholder="Type a message..."
          className="resize-none"
        />
        <Button onClick={send} disabled={loading} className="px-3">
          Send
        </Button>
      </div>
    </div>
  );
}
