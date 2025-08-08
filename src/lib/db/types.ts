export type User = {
  id: number;
  email: string;
  name: string;
  picture: string;
} & (
  | {
      google_id: string;
      github_id: string;
    }
  | {
      google_id: string;
      github_id: null;
    }
  | {
      google_id: null;
      github_id: string;
    }
);

export type Session = {
  id: string;
  user_id: number;
  expires_at: Date;
};

export type SessionAndUserRow = {
  user_id: number;
  expires_at: Date;
  user_id_from_users_table: number;
  google_id: string | null;
  github_id: string | null;
  email: string;
  name: string;
  picture: string;
};

export type Provider = "google" | "github";

export type Profile = {
  providerId: string;
  email: string;
  name: string;
  picture: string;
};
