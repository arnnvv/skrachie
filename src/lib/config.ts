import type { ResponseCookie } from "next/dist/compiled/@edge-runtime/cookies";

function getEnvVar(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`${key} environment variable is not set.`);
  }
  return value;
}

export const appConfig = {
  google: {
    clientId: getEnvVar("GOOGLE_CLIENT_ID"),
    clientSecret: getEnvVar("GOOGLE_CLIENT_SECRET"),
    redirectUrl: getEnvVar("GOOGLE_REDIRECT_URL"),
  },
  github: {
    clientId: getEnvVar("GITHUB_CLIENT_ID"),
    clientSecret: getEnvVar("GITHUB_CLIENT_SECRET"),
    redirectUrl: getEnvVar("GITHUB_REDIRECT_URL"),
  },
  database: {
    connectionString: getEnvVar("DATABASE_URL"),
    pool: {
      max: Number(getEnvVar("DB_POOL_MAX")),
      idleTimeoutMillis: Number(getEnvVar("DB_IDLE_TIMEOUT_MS")),
      connectionTimeoutMillis: Number(getEnvVar("DB_CONNECTION_TIMEOUT_MS")),
    },
  },
  oauthCookieOptions: {
    path: "/",
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax",
  } as const satisfies Partial<ResponseCookie>,
};
