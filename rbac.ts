import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export type Role = "REQUESTER" | "VOLUNTEER" | "COORDINATOR";

/**
 * Ensures a request is authenticated, and optionally restricted to a set of
 * roles. Returns either the session or a ready-to-return 401/403 response,
 * so route handlers can do:
 *
 *   const guard = await requireRole(["COORDINATOR"]);
 *   if (guard.response) return guard.response;
 *   const session = guard.session;
 */
export async function requireRole(allowed?: Role[]) {
  const session = await auth();

  if (!session?.user) {
    return { session: null, response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  if (allowed && !allowed.includes(session.user.role)) {
    return { session: null, response: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }

  return { session, response: null as NextResponse | null };
}

/** Ownership check: coordinators bypass, others must own the resource. */
export function canAccessOwned(sessionUserId: string, sessionRole: Role, ownerId: string) {
  return sessionRole === "COORDINATOR" || sessionUserId === ownerId;
}
