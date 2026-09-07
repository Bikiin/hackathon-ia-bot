import { pgTable, varchar } from "drizzle-orm/pg-core";

export const pacientes = pgTable("pacientes", {
  id: varchar("id", { length: 32 }).primaryKey(),
  nombre: varchar("nombre", { length: 120 }).notNull(),
  numeroAfiliado: varchar("numero_afiliado", { length: 32 }).notNull(),
  planId: varchar("plan_id", { length: 32 }).notNull(),
  plan: varchar("plan", { length: 64 }).notNull(),
});

export type Paciente = typeof pacientes.$inferSelect;
