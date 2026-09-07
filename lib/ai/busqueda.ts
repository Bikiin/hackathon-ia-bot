import { embed } from "ai";
import { and, cosineDistance, desc, eq, gt, inArray, sql } from "drizzle-orm";

import { db } from "@/lib/db";
import { chunks } from "@/lib/db/schema/chunks";
import type { Fuente, Metadata, TipoChunk } from "@/lib/ingesta/tipos";

import { EMBEDDING_MODEL } from "./models";

const SIN_PLAN: TipoChunk[] = ["sintoma", "hospital"];

const LIMITES: Record<TipoChunk, number> = {
  sintoma: 5,
  cobertura: 6,
  ranking: 3,
  condicion: 5,
  hospital: 5,
};

const UMBRAL_MINIMO = 0.15;

export type Alcance = "mi_plan" | "todos_los_planes";

export type Resultado = {
  id: string;
  tipo: TipoChunk;
  plan: string | null;
  esSuPlan: boolean;
  similitud: number;
  contenido: string;
  metadata: Metadata;
  fuentes: Fuente[];
};

export type Busqueda = {
  consulta: string;
  tipo: TipoChunk;
  alcance: Alcance;
  planId: string;
};

export async function buscar({
  consulta,
  tipo,
  alcance,
  planId,
}: Busqueda): Promise<Resultado[]> {
  const { embedding } = await embed({
    model: EMBEDDING_MODEL,
    value: consulta.replaceAll("\n", " "),
  });

  const similitud = sql<number>`1 - (${cosineDistance(chunks.embedding, embedding)})`;

  const acotado = !SIN_PLAN.includes(tipo) && alcance === "mi_plan";

  const filtros = [
    eq(chunks.tipo, tipo),
    gt(similitud, UMBRAL_MINIMO),
    ...(acotado ? [inArray(chunks.planId, [planId])] : []),
  ];

  const filas = await db
    .select({
      id: chunks.id,
      tipo: chunks.tipo,
      planId: chunks.planId,
      similitud,
      contenido: chunks.contenido,
      metadata: chunks.metadata,
      fuentes: chunks.fuentes,
    })
    .from(chunks)
    .where(and(...filtros))
    .orderBy((fila) => desc(fila.similitud))
    .limit(LIMITES[tipo]);

  return filas.map(({ planId: planDelChunk, ...fila }) => ({
    ...fila,
    plan: (fila.metadata.plan as string) ?? null,
    esSuPlan: planDelChunk === null || planDelChunk === planId,
    similitud: Number(fila.similitud.toFixed(3)),
  }));
}
