import "dotenv/config";

import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { sql } from "drizzle-orm";

import { db } from "@/lib/db";
import { chunks, type NuevoChunk } from "@/lib/db/schema/chunks";
import type { ArchivoProcesado } from "@/lib/ingesta/tipos";

const PROCESSED = "documentos/processed";
const TAMANO_LOTE = 40;

function leerTodos(): { archivo: string; datos: ArchivoProcesado }[] {
  return readdirSync(PROCESSED)
    .flatMap((familia) =>
      readdirSync(join(PROCESSED, familia))
        .filter((nombre) => nombre.endsWith(".json"))
        .map((nombre) => join(familia, nombre)),
    )
    .sort()
    .map((archivo) => ({
      archivo,
      datos: JSON.parse(readFileSync(join(PROCESSED, archivo), "utf8")),
    }));
}

function aFila(
  chunk: ArchivoProcesado["chunks"][number],
  documento: string,
): NuevoChunk {
  if (chunk.embedding.vector === null) {
    throw new Error(`${chunk.id} no tiene embedding, corre pnpm embeddings`);
  }

  return {
    id: chunk.id,
    tipo: chunk.tipo,
    planId: (chunk.metadata.plan_id as string) ?? null,
    especialidad: (chunk.metadata.especialidad as string) ?? null,
    hospitalId: (chunk.metadata.hospital_id as string) ?? null,
    documento,
    contenido: chunk.contenido,
    textoEmbebible: chunk.textoEmbebible,
    metadata: chunk.metadata,
    fuentes: chunk.fuentes,
    embedding: chunk.embedding.vector,
  };
}

async function main(): Promise<void> {
  const archivos = leerTodos();
  const filas = archivos.flatMap(({ datos }) =>
    datos.chunks.map((chunk) => aFila(chunk, datos.documento.archivo)),
  );

  console.log(`${filas.length} chunks en ${archivos.length} archivos`);

  for (let inicio = 0; inicio < filas.length; inicio += TAMANO_LOTE) {
    const lote = filas.slice(inicio, inicio + TAMANO_LOTE);

    await db
      .insert(chunks)
      .values(lote)
      .onConflictDoUpdate({
        target: chunks.id,
        set: {
          tipo: sql`excluded.tipo`,
          planId: sql`excluded.plan_id`,
          especialidad: sql`excluded.especialidad`,
          hospitalId: sql`excluded.hospital_id`,
          documento: sql`excluded.documento`,
          contenido: sql`excluded.contenido`,
          textoEmbebible: sql`excluded.texto_embebible`,
          metadata: sql`excluded.metadata`,
          fuentes: sql`excluded.fuentes`,
          embedding: sql`excluded.embedding`,
        },
      });

    console.log(`  ${Math.min(inicio + TAMANO_LOTE, filas.length)}/${filas.length}`);
  }

  const resumen = await db
    .select({ tipo: chunks.tipo, total: sql<number>`count(*)::int` })
    .from(chunks)
    .groupBy(chunks.tipo)
    .orderBy(chunks.tipo);

  console.log("\nen la base de datos:");
  for (const { tipo, total } of resumen) {
    console.log(`  ${tipo.padEnd(12)} ${total}`);
  }

  process.exit(0);
}

main();
