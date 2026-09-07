CREATE TABLE IF NOT EXISTS "chunks" (
	"id" varchar(191) PRIMARY KEY NOT NULL,
	"tipo" varchar(32) NOT NULL,
	"plan_id" varchar(32),
	"especialidad" varchar(64),
	"hospital_id" varchar(32),
	"documento" varchar(191) NOT NULL,
	"contenido" text NOT NULL,
	"texto_embebible" text NOT NULL,
	"metadata" jsonb NOT NULL,
	"fuentes" jsonb NOT NULL,
	"embedding" vector(1536) NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "embeddings" (
	"id" varchar(191) PRIMARY KEY NOT NULL,
	"resource_id" varchar(191),
	"content" text NOT NULL,
	"embedding" vector(1536) NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "embeddings" ADD CONSTRAINT "embeddings_resource_id_resources_id_fk" FOREIGN KEY ("resource_id") REFERENCES "public"."resources"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "chunks_embedding_idx" ON "chunks" USING hnsw ("embedding" vector_cosine_ops);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "chunks_filtro_idx" ON "chunks" USING btree ("tipo","plan_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "chunks_especialidad_idx" ON "chunks" USING btree ("plan_id","especialidad");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "embeddingIndex" ON "embeddings" USING hnsw ("embedding" vector_cosine_ops);