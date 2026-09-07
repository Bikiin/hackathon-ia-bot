import { index, jsonb, pgTable, text, varchar, vector } from "drizzle-orm/pg-core";

import { EMBEDDING_DIMENSIONS } from "@/lib/ai/models";
import type { Fuente, Metadata, TipoChunk } from "@/lib/ingesta/tipos";

export const chunks = pgTable(
  "chunks",
  {
    id: varchar("id", { length: 191 }).primaryKey(),
    tipo: varchar("tipo", { length: 32 }).$type<TipoChunk>().notNull(),
    planId: varchar("plan_id", { length: 32 }),
    especialidad: varchar("especialidad", { length: 64 }),
    hospitalId: varchar("hospital_id", { length: 32 }),
    documento: varchar("documento", { length: 191 }).notNull(),
    contenido: text("contenido").notNull(),
    textoEmbebible: text("texto_embebible").notNull(),
    metadata: jsonb("metadata").$type<Metadata>().notNull(),
    fuentes: jsonb("fuentes").$type<Fuente[]>().notNull(),
    embedding: vector("embedding", {
      dimensions: EMBEDDING_DIMENSIONS,
    }).notNull(),
  },
  (tabla) => ({
    embeddingIdx: index("chunks_embedding_idx").using(
      "hnsw",
      tabla.embedding.op("vector_cosine_ops"),
    ),
    filtroIdx: index("chunks_filtro_idx").on(tabla.tipo, tabla.planId),
    especialidadIdx: index("chunks_especialidad_idx").on(
      tabla.planId,
      tabla.especialidad,
    ),
  }),
);

export type Chunk = typeof chunks.$inferSelect;
export type NuevoChunk = typeof chunks.$inferInsert;
