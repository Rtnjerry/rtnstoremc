CREATE TABLE IF NOT EXISTS "admins" (
	"id" serial PRIMARY KEY,
	"email" text NOT NULL UNIQUE,
	"added_by" text DEFAULT 'system' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
INSERT INTO "admins" ("email", "added_by") VALUES
	('domauff757@gmail.com', 'system'),
	('rtnjerry27@gmail.com', 'system'),
	('rathanakny2006@gmail.com', 'system')
ON CONFLICT ("email") DO NOTHING;
