import { db } from "./db";
import type { User, Session, SessionAndUserRow } from "./db/types";
import { sha256 } from "./sha";
import { encodeBase64urlNoPadding, encodeHexLowerCase } from "./encoding";
import {
  SESSION_MAX_AGE_SECONDS,
  SESSION_REFRESH_THRESHOLD_SECONDS,
} from "./constants";

export type SessionValidationResult =
  | { session: Session; user: User }
  | { session: null; user: null };

export function generateSessionToken(): string {
  const bytes = new Uint8Array(20);
  crypto.getRandomValues(bytes);
  return encodeBase64urlNoPadding(bytes);
}

export async function createSession(
  token: string,
  userId: number,
): Promise<Session> {
  const sessionId = encodeHexLowerCase(
    await sha256(new TextEncoder().encode(token)),
  );

  const expiresAt = new Date(Date.now() + SESSION_MAX_AGE_SECONDS * 1000);

  const session: Session = {
    id: sessionId,
    user_id: userId,
    expires_at: expiresAt,
  };

  await db.query(
    "INSERT INTO scratchy_sessions (id, user_id, expires_at) VALUES ($1, $2, $3)",
    [session.id, session.user_id, session.expires_at],
  );

  return session;
}

export async function validateSessionToken(
  token: string,
): Promise<SessionValidationResult> {
  "use cache";
  const sessionId = encodeHexLowerCase(
    await sha256(new TextEncoder().encode(token)),
  );

  const sessionAndUserResult = await db.query<SessionAndUserRow>(
    `
      SELECT
        s.user_id,
        s.expires_at,
        u.id as user_id_from_users_table,
        u.github_id,
        u.google_id,
        u.email,
        u.name,
        u.picture
      FROM scratchy_sessions s
      JOIN scratchy_users u ON s.user_id = u.id
      WHERE s.id = $1 LIMIT 1
    `,
    [sessionId],
  );

  if (sessionAndUserResult.rowCount === 0) {
    return { session: null, user: null };
  }

  const data = sessionAndUserResult.rows[0];
  const now = Date.now();
  const expiresAtMs = data.expires_at.getTime();

  if (now >= expiresAtMs) {
    await db.query("DELETE FROM scratchy_sessions WHERE id = $1", [sessionId]);
    return { session: null, user: null };
  }

  if (data.google_id === null && data.github_id === null) {
    console.error(
      `FATAL: User with id ${data.user_id_from_users_table} has no provider ID. Invalidating session.`,
    );
    await invalidateSession(sessionId);
    return { session: null, user: null };
  }

  const user = {
    id: data.user_id_from_users_table,
    google_id: data.google_id,
    github_id: data.github_id,
    email: data.email,
    name: data.name,
    picture: data.picture,
  } as User;

  const session: Session = {
    id: sessionId,
    user_id: user.id,
    expires_at: data.expires_at,
  };

  const refreshThresholdMs = SESSION_REFRESH_THRESHOLD_SECONDS * 1000;
  if (now >= expiresAtMs - refreshThresholdMs) {
    const newExpiresAt = new Date(now + SESSION_MAX_AGE_SECONDS * 1000);
    await db.query(
      "UPDATE scratchy_sessions SET expires_at = $1 WHERE id = $2",
      [newExpiresAt, session.id],
    );
    session.expires_at = newExpiresAt;
  }

  return { session, user };
}

export async function invalidateSession(sessionId: string): Promise<void> {
  await db.query("DELETE FROM scratchy_sessions WHERE id = $1", [sessionId]);
}
