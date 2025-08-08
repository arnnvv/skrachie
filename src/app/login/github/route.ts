import { getCurrentSession } from "@/actions";
import {
  GITHUB_OAUTH_STATE_COOKIE_NAME,
  OAUTH_COOKIE_MAX_AGE_SECONDS,
} from "@/lib/constants";
import { generateState, github } from "@/lib/oauth";
import { globalGETRateLimit } from "@/lib/requests";
import { cookies } from "next/headers";

export async function GET(request: Request): Promise<Response> {
  if (!(await globalGETRateLimit())) {
    return new Response("Too many requests", {
      status: 429,
    });
  }

  const { session } = await getCurrentSession();
  if (session !== null) {
    return Response.redirect(new URL("/", request.url));
  }

  const state = generateState();
  const url = github.createAuthorizationURL(state, ["user:email"]);

  (await cookies()).set(GITHUB_OAUTH_STATE_COOKIE_NAME, state, {
    path: "/",
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    maxAge: OAUTH_COOKIE_MAX_AGE_SECONDS,
    sameSite: "lax",
  });

  return Response.redirect(url);
}
