"use server";

import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { globalPOSTRateLimit } from "./lib/requests";
import { deleteSessionTokenCookie } from "./lib/session";
import type { SessionValidationResult } from "./lib/auth";
import { invalidateSession, validateSessionToken } from "./lib/auth";

export const getCurrentSession = cache(
  async (): Promise<SessionValidationResult> => {
    const token = (await cookies()).get("session")?.value ?? null;
    if (token === null) {
      return {
        session: null,
        user: null,
      };
    }
    return validateSessionToken(token);
  },
);

export const signOutAction = async (): Promise<{
  message: string;
}> => {
  const { session } = await getCurrentSession();
  if (session === null) {
    return {
      message: "Not authenticated",
    };
  }

  if (!(await globalPOSTRateLimit())) {
    return {
      message: "Too many requests",
    };
  }

  try {
    await invalidateSession(session.id);
    await deleteSessionTokenCookie();
  } catch (e) {
    console.error(`Error during session invalidation: ${e}`);
    return {
      message: "An unexpected error occurred during sign out.",
    };
  }
  redirect("/login");
};
