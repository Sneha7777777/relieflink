import { generateObject, generateText } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";

const model = openai(process.env.AI_MODEL || "gpt-4o-mini");

// ---------------------------------------------------------------------------
// 1. Triage: turn a free-text description into a structured urgency signal.
// ---------------------------------------------------------------------------

const triageSchema = z.object({
  urgency: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]),
  score: z.number().int().min(1).max(10),
  summary: z.string().max(240),
  rationale: z.string().max(400),
});

export type TriageResult = z.infer<typeof triageSchema>;

export async function triageRequest(input: {
  title: string;
  description: string;
  headcount: number;
  category: string;
}): Promise<TriageResult> {
  const { object } = await generateObject({
    model,
    schema: triageSchema,
    system: `You are a disaster-response triage assistant. You read a help
request and output an urgency classification. Prioritize signals like:
immediate danger to life, medical emergencies, exposure/weather risk,
presence of children/elderly/disabled people, and time sensitivity.
Be conservative: when in doubt between two levels, prefer the higher one for
CRITICAL-adjacent risk to life, but do not inflate routine requests.
Never fabricate details not present in the text.`,
    prompt: `Category: ${input.category}
People affected: ${input.headcount}
Title: ${input.title}
Description: ${input.description}

Classify urgency and produce a short, factual summary and rationale.`,
  });

  return object;
}

// ---------------------------------------------------------------------------
// 2. Matching: given one request and a shortlist of candidate offers
//    (pre-filtered by category/location in SQL), ask the model to rank them.
// ---------------------------------------------------------------------------

const matchSchema = z.object({
  rankings: z.array(
    z.object({
      offerId: z.string(),
      confidence: z.number().min(0).max(1),
      reasoning: z.string().max(300),
    })
  ),
});

export async function rankMatches(
  request: { title: string; description: string; category: string; headcount: number; location: string },
  candidates: { id: string; title: string; description: string; quantity: number; location: string }[]
) {
  if (candidates.length === 0) return { rankings: [] };

  const { object } = await generateObject({
    model,
    schema: matchSchema,
    system: `You are a resource-matching assistant for disaster relief. Given
one help request and several candidate resource offers already filtered to
the same category, rank how well each offer satisfies the request. Consider
quantity vs headcount, location proximity described in text, and any fit
signals in the descriptions. Return every candidate id exactly once.`,
    prompt: `REQUEST
Title: ${request.title}
Category: ${request.category}
Headcount: ${request.headcount}
Location: ${request.location}
Description: ${request.description}

CANDIDATE OFFERS
${candidates
  .map((c, i) => `${i + 1}. id=${c.id} | ${c.title} | qty=${c.quantity} | location=${c.location} | ${c.description}`)
  .join("\n")}
`,
  });

  return object;
}

// ---------------------------------------------------------------------------
// 3. Coordinator assistant: a lightweight chat helper grounded in a system
//    prompt that keeps it scoped to the platform's domain.
// ---------------------------------------------------------------------------

export async function assistantReply(message: string, history: { role: "user" | "assistant"; content: string }[]) {
  const { text } = await generateText({
    model,
    system: `You are the ReliefLink coordinator assistant. You help
volunteers and coordinators reason about active disaster-relief requests:
prioritization, logistics, and communication drafting. You do not have
live access to the database in this call — if asked for specific live data,
tell the user to check the dashboard. Keep answers concise and practical.
Never give medical, legal, or safety-critical instructions beyond general,
widely-accepted best practice; for anything life-threatening, tell the user
to contact local emergency services immediately.`,
    messages: [...history, { role: "user", content: message }],
  });

  return text;
}
