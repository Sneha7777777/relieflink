import { describe, it, expect } from "vitest";
import {
  registerSchema,
  helpRequestSchema,
  resourceOfferSchema,
  loginSchema,
} from "@/lib/validation";

describe("registerSchema", () => {
  it("accepts a valid registration payload", () => {
    const result = registerSchema.safeParse({
      name: "Jamie Rivera",
      email: "jamie@example.com",
      password: "StrongPass1",
      role: "REQUESTER",
    });
    expect(result.success).toBe(true);
  });

  it("rejects weak passwords", () => {
    const result = registerSchema.safeParse({
      name: "Jamie",
      email: "jamie@example.com",
      password: "weak",
      role: "REQUESTER",
    });
    expect(result.success).toBe(false);
  });

  it("rejects role=COORDINATOR from public signup", () => {
    const result = registerSchema.safeParse({
      name: "Jamie",
      email: "jamie@example.com",
      password: "StrongPass1",
      role: "COORDINATOR",
    });
    expect(result.success).toBe(false);
  });

  it("rejects malformed email", () => {
    const result = registerSchema.safeParse({
      name: "Jamie",
      email: "not-an-email",
      password: "StrongPass1",
      role: "REQUESTER",
    });
    expect(result.success).toBe(false);
  });
});

describe("loginSchema", () => {
  it("requires both email and password", () => {
    expect(loginSchema.safeParse({ email: "a@b.com" }).success).toBe(false);
    expect(loginSchema.safeParse({ email: "a@b.com", password: "x" }).success).toBe(true);
  });
});

describe("helpRequestSchema", () => {
  const base = {
    title: "Need shelter",
    description: "Our home flooded, we need temporary shelter for a few days.",
    category: "SHELTER",
    headcount: 3,
    location: "Riverside District",
  };

  it("accepts a valid request", () => {
    expect(helpRequestSchema.safeParse(base).success).toBe(true);
  });

  it("rejects an invalid category", () => {
    expect(helpRequestSchema.safeParse({ ...base, category: "SPACESHIP" }).success).toBe(false);
  });

  it("rejects headcount of 0", () => {
    expect(helpRequestSchema.safeParse({ ...base, headcount: 0 }).success).toBe(false);
  });

  it("rejects script-injection attempts in text fields", () => {
    const result = helpRequestSchema.safeParse({
      ...base,
      title: "<script>alert(1)</script>",
    });
    expect(result.success).toBe(false);
  });

  it("rejects an empty description", () => {
    expect(helpRequestSchema.safeParse({ ...base, description: "" }).success).toBe(false);
  });
});

describe("resourceOfferSchema", () => {
  it("accepts a valid offer", () => {
    const result = resourceOfferSchema.safeParse({
      title: "Blankets available",
      description: "20 blankets, clean and ready.",
      category: "SHELTER",
      quantity: 20,
      location: "Downtown warehouse",
    });
    expect(result.success).toBe(true);
  });

  it("rejects negative quantity", () => {
    const result = resourceOfferSchema.safeParse({
      title: "Blankets",
      description: "desc",
      category: "SHELTER",
      quantity: -5,
      location: "Downtown",
    });
    expect(result.success).toBe(false);
  });
});
