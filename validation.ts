import { z } from "zod";

// Shared primitives -----------------------------------------------------

const safeText = (max: number) =>
  z
    .string()
    .trim()
    .min(1, "Required")
    .max(max)
    // Strip characters commonly used in stored-XSS / HTML-injection payloads.
    // We rely on React's default escaping for render-time safety too, this
    // is defense-in-depth at the persistence layer.
    .refine((val) => !/<script|javascript:|on\w+\s*=/i.test(val), {
      message: "Input contains disallowed content",
    });

export const resourceCategory = z.enum([
  "FOOD",
  "WATER",
  "SHELTER",
  "MEDICAL",
  "CLOTHING",
  "TRANSPORT",
  "RESCUE",
  "OTHER",
]);

// Auth --------------------------------------------------------------------

export const registerSchema = z.object({
  name: safeText(80),
  email: z.string().trim().toLowerCase().email().max(254),
  password: z
    .string()
    .min(10, "Password must be at least 10 characters")
    .max(128)
    .regex(/[a-z]/, "Add a lowercase letter")
    .regex(/[A-Z]/, "Add an uppercase letter")
    .regex(/[0-9]/, "Add a number"),
  role: z.enum(["REQUESTER", "VOLUNTEER"]), // COORDINATOR is provisioned manually, never via public signup
  organization: safeText(120).optional().nullable(),
  phone: z.string().trim().max(30).optional().nullable(),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1),
});

// Help Requests -------------------------------------------------------------

export const helpRequestSchema = z.object({
  title: safeText(120),
  description: safeText(4000),
  category: resourceCategory,
  headcount: z.coerce.number().int().min(1).max(10000),
  location: safeText(200),
  latitude: z.coerce.number().min(-90).max(90).optional().nullable(),
  longitude: z.coerce.number().min(-180).max(180).optional().nullable(),
});

export const helpRequestUpdateSchema = helpRequestSchema.partial().extend({
  status: z.enum(["OPEN", "MATCHED", "IN_PROGRESS", "FULFILLED", "CANCELLED"]).optional(),
});

// Resource Offers -----------------------------------------------------------

export const resourceOfferSchema = z.object({
  title: safeText(120),
  description: safeText(4000),
  category: resourceCategory,
  quantity: z.coerce.number().int().min(1).max(100000),
  location: safeText(200),
  latitude: z.coerce.number().min(-90).max(90).optional().nullable(),
  longitude: z.coerce.number().min(-180).max(180).optional().nullable(),
});

export const resourceOfferUpdateSchema = resourceOfferSchema.partial().extend({
  available: z.boolean().optional(),
});

// AI endpoints ----------------------------------------------------------------

export const summarizeSchema = z.object({
  requestId: z.string().cuid(),
});

export const matchSchema = z.object({
  requestId: z.string().cuid(),
});

export const assistantSchema = z.object({
  message: safeText(2000),
  // Client-side conversation history, capped to avoid unbounded token spend
  history: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: safeText(2000),
      })
    )
    .max(20)
    .optional()
    .default([]),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type HelpRequestInput = z.infer<typeof helpRequestSchema>;
export type ResourceOfferInput = z.infer<typeof resourceOfferSchema>;
