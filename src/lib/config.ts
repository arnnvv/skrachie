function getEnvVar(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`${key} environment variable is not set.`);
  }
  return value;
}

function getOAuthConfig(provider: "google" | "github") {
  const p = provider.toUpperCase();
  return {
    clientId: getEnvVar(`${p}_CLIENT_ID`),
    clientSecret: getEnvVar(`${p}_CLIENT_SECRET`),
    redirectUrl: getEnvVar(`${p}_REDIRECT_URL`),
  };
}

export const googleOAuthConfig = getOAuthConfig("google");

export const githubOAuthConfig = getOAuthConfig("github");

export const dbConfig = {
  connectionString: getEnvVar("DATABASE_URL"),
  pool: {
    max: parseInt(process.env.DB_POOL_MAX || "10", 10),
    idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT_MS || "10000", 10),
    connectionTimeoutMillis: parseInt(
      process.env.DB_CONNECTION_TIMEOUT_MS || "0",
      10,
    ),
  },
};
