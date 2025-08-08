CREATE TABLE "scratchy_sessions" (
    "id" text PRIMARY KEY NOT NULL,
    "user_id" integer NOT NULL,
    "expires_at" timestamp with time zone NOT NULL
);

CREATE TABLE "scratchy_users" (
    "id" serial PRIMARY KEY NOT NULL,
    "google_id" text UNIQUE,
    "github_id" text UNIQUE,
    "email" varchar NOT NULL UNIQUE,
    "name" text NOT NULL,
    "picture" text NOT NULL,
    CONSTRAINT "scratchy_users_google_id_unique" UNIQUE("google_id"),
    CONSTRAINT "scratchy_users_email_unique" UNIQUE("email")
);

ALTER TABLE "scratchy_sessions" ADD CONSTRAINT "scratchy_sessions_user_id_scratchy_users_id_fk"
    FOREIGN KEY ("user_id") REFERENCES "public"."scratchy_users"("id")
    ON DELETE CASCADE ON UPDATE NO ACTION;

CREATE INDEX "session_user_id_idx" ON "scratchy_sessions" USING btree ("user_id");
CREATE INDEX "google_id_idx" ON "scratchy_users" USING btree ("google_id");
CREATE INDEX "email_idx" ON "scratchy_users" USING btree ("email");
