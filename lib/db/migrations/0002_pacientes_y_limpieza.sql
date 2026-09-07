CREATE TABLE IF NOT EXISTS "pacientes" (
	"id" varchar(32) PRIMARY KEY NOT NULL,
	"nombre" varchar(120) NOT NULL,
	"numero_afiliado" varchar(32) NOT NULL,
	"plan_id" varchar(32) NOT NULL,
	"plan" varchar(64) NOT NULL
);
--> statement-breakpoint
DROP TABLE IF EXISTS "embeddings";--> statement-breakpoint
DROP TABLE IF EXISTS "resources";
