import { db } from "./db";
import { PROVIDER } from "./constants";
import type { User } from "./db/types";

type Provider = (typeof PROVIDER)[keyof typeof PROVIDER];

type Profile = {
  providerId: string;
  email: string;
  name: string;
  picture: string;
};

const UPSERT_USER_QUERIES = {
  [PROVIDER.GOOGLE]: `
    WITH input (google_id, email, name, picture) AS (
      VALUES ($1::text, $2::text, $3::text, $4::text)
    ),
    found_and_updated AS (
      UPDATE scratchy_users u
      SET name = i.name, picture = i.picture
      FROM input i
      WHERE u.google_id = i.google_id
        AND (u.name != i.name OR u.picture != i.picture)
      RETURNING u.*
    ),
    found_unchanged AS (
      SELECT u.*
      FROM scratchy_users u, input i
      WHERE u.google_id = i.google_id AND NOT EXISTS (SELECT 1 FROM found_and_updated)
    ),
    linked_by_email AS (
      UPDATE scratchy_users u
      SET google_id = i.google_id
      FROM input i
      WHERE u.email = i.email AND u.google_id IS NULL
        AND NOT EXISTS (SELECT 1 FROM found_and_updated)
        AND NOT EXISTS (SELECT 1 FROM found_unchanged)
      RETURNING u.*
    ),
    inserted_new AS (
      INSERT INTO scratchy_users (google_id, email, name, picture)
      SELECT google_id, email, name, picture
      FROM input
      WHERE NOT EXISTS (SELECT 1 FROM found_and_updated)
        AND NOT EXISTS (SELECT 1 FROM found_unchanged)
        AND NOT EXISTS (SELECT 1 FROM linked_by_email)
      RETURNING *
    )
    SELECT * FROM found_and_updated
    UNION ALL
    SELECT * FROM found_unchanged
    UNION ALL
    SELECT * FROM linked_by_email
    UNION ALL
    SELECT * FROM inserted_new;
  `,
  [PROVIDER.GITHUB]: `
    WITH input (github_id, email, name, picture) AS (
      VALUES ($1::text, $2::text, $3::text, $4::text)
    ),
    found_and_updated AS (
      UPDATE scratchy_users u
      SET name = i.name, picture = i.picture
      FROM input i
      WHERE u.github_id = i.github_id
        AND (u.name != i.name OR u.picture != i.picture)
      RETURNING u.*
    ),
    found_unchanged AS (
      SELECT u.*
      FROM scratchy_users u, input i
      WHERE u.github_id = i.github_id AND NOT EXISTS (SELECT 1 FROM found_and_updated)
    ),
    linked_by_email AS (
      UPDATE scratchy_users u
      SET github_id = i.github_id
      FROM input i
      WHERE u.email = i.email AND u.github_id IS NULL
        AND NOT EXISTS (SELECT 1 FROM found_and_updated)
        AND NOT EXISTS (SELECT 1 FROM found_unchanged)
      RETURNING u.*
    ),
    inserted_new AS (
      INSERT INTO scratchy_users (github_id, email, name, picture)
      SELECT github_id, email, name, picture
      FROM input
      WHERE NOT EXISTS (SELECT 1 FROM found_and_updated)
        AND NOT EXISTS (SELECT 1 FROM found_unchanged)
        AND NOT EXISTS (SELECT 1 FROM linked_by_email)
      RETURNING *
    )
    SELECT * FROM found_and_updated
    UNION ALL
    SELECT * FROM found_unchanged
    UNION ALL
    SELECT * FROM linked_by_email
    UNION ALL
    SELECT * FROM inserted_new;
  `,
};

async function upsertUser(provider: Provider, profile: Profile): Promise<User> {
  const query = UPSERT_USER_QUERIES[provider];
  const params = [
    profile.providerId,
    profile.email,
    profile.name,
    profile.picture,
  ];

  const result = await db.query<User>(query, params);

  if (result.rowCount === 0 || !result.rows[0]) {
    throw new Error("User upsert query failed to return a user row.");
  }

  return result.rows[0];
}

export async function upsertUserFromGoogleProfile(
  googleId: string,
  email: string,
  name: string,
  picture: string,
): Promise<User> {
  try {
    return await upsertUser(PROVIDER.GOOGLE, {
      providerId: googleId,
      email,
      name,
      picture,
    });
  } catch (error) {
    console.error(`Error in upsertUserFromGoogleProfile: ${error}`);
    throw new Error("Could not create or update user profile from Google.");
  }
}

export async function upsertUserFromGitHubProfile(
  githubId: string,
  email: string,
  name: string,
  picture: string,
): Promise<User> {
  try {
    return await upsertUser(PROVIDER.GITHUB, {
      providerId: githubId,
      email,
      name,
      picture,
    });
  } catch (error) {
    console.error(`Error in upsertUserFromGitHubProfile: ${error}`);
    throw new Error("Could not create or update user profile from GitHub.");
  }
}
