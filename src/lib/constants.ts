export const SESSION_COOKIE_NAME = "session";
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;
export const SESSION_REFRESH_THRESHOLD_SECONDS = 60 * 60 * 24 * 15;

export const GOOGLE_OAUTH_STATE_COOKIE_NAME = "google_oauth_state";
export const GOOGLE_OAUTH_CODE_VERIFIER_COOKIE_NAME = "google_code_verifier";
export const GOOGLE_OAUTH_NONCE_COOKIE_NAME = "google_oauth_nonce";

export const GITHUB_OAUTH_STATE_COOKIE_NAME = "github_oauth_state";
export const GITHUB_OAUTH_CODE_VERIFIER_COOKIE_NAME = "github_code_verifier";

export const OAUTH_COOKIE_MAX_AGE_SECONDS = 60 * 10;

export const GITHUB_TOKEN_ENDPOINT =
  "https://github.com/login/oauth/access_token";
export const GITHUB_USER_ENDPOINT = "https://api.github.com/user";
export const GITHUB_USER_EMAILS_ENDPOINT = "https://api.github.com/user/emails";

export const CLEANUP_INTERVAL_MS = 60 * 60 * 1000;
export const BUCKET_EXPIRATION_MS = 24 * 60 * 60 * 1000;

export const PROVIDER = {
  GOOGLE: "google",
  GITHUB: "github",
} as const;
