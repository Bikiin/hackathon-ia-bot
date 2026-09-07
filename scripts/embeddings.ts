import "dotenv/config";

import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { embedMany } from "ai";

import { EMBEDDING_DIMENSIONS, EMBEDDING_MODEL } from "@/lib/ai/models";
import { conReintento } from "@/lib/reintentar";
import type { ArchivoProcesado, ChunkProcesado } from "@/lib/ingesta/tipos";

const PROCESSED = "documentos/processed";
const TAMANO_LOTE = 32;
const REINTENTOS = 6;
const ESPERA_MS = 20000;
const MARCA_VECTOR = "__VECTOR__";

type Pendiente = {
  ruta: string;
  chunk: ChunkProcesado;
};

const dormir = (ms: number) => new Promise((r) => setTimeout(r, ms));

function rutas(): string[] {
  return readdirSync(PROCESSED)
    .flatMap((familia) =>
      readdirSync(join(PROCESSED, familia))
        .filter((archivo) => archivo.endsWith(".json"))
        .map((archivo) => join(PROCESSED, familia, archivo)),
    )
    .sort();
}

function leer(ruta: string): ArchivoProcesado {
  return JSON.parse(readFileSync(ruta, "utf8"));
}

function escribir(ruta: string, archivo: ArchivoProcesado): void {
  archivo.embeddingsPendientes = archivo.chunks.filter(
    (c) => c.embedding.vector === null,
  ).length;

  const vectores: number[][] = [];
  const texto = JSON.stringify(
    archivo,
    (_clave, valor) => {
      if (Array.isArray(valor) && typeof valor[0] === "number") {
        vectores.push(valor as number[]);
        return `${MARCA_VECTOR}${vectores.length - 1}`;
      }
      return valor;
    },
    2,
  ).replace(
    new RegExp(`"${MARCA_VECTOR}(\\d+)"`, "g"),
    (_coincidencia, indice) => JSON.stringify(vectores[Number(indice)]),
  );

  writeFileSync(ruta, `${texto}\n`);
}

async function embeberLote(valores: string[]): Promise<number[][]> {
  const { embeddings } = await conReintento(
    () => embedMany({ model: EMBEDDING_MODEL, values: valores, maxRetries: 0 }),
    {
      alEsperar: (espera, intento) =>
        console.log(`    cuota agotada, intento ${intento}, espero ${Math.round(espera / 1000)}s`),
    },
  );

  return embeddings;
}

async function main(): Promise<void> {
  const archivos = new Map(rutas().map((ruta) => [ruta, leer(ruta)]));

  const pendientes: Pendiente[] = [...archivos].flatMap(([ruta, archivo]) =>
    archivo.chunks
      .filter((chunk) => chunk.embedding.vector === null)
      .map((chunk) => ({ ruta, chunk })),
  );

  const total = [...archivos.values()].reduce((n, a) => n + a.total, 0);

  console.log(`${total} chunks, ${pendientes.length} sin embedding`);

  if (pendientes.length === 0) {
    return;
  }

  const generado = new Date().toISOString();

  for (let inicio = 0; inicio < pendientes.length; inicio += TAMANO_LOTE) {
    const lote = pendientes.slice(inicio, inicio + TAMANO_LOTE);
    const numero = Math.floor(inicio / TAMANO_LOTE) + 1;
    const lotes = Math.ceil(pendientes.length / TAMANO_LOTE);

    console.log(`  lote ${numero}/${lotes} (${lote.length} chunks)`);

    const vectores = await embeberLote(lote.map((p) => p.chunk.textoEmbebible));

    lote.forEach((pendiente, indice) => {
      pendiente.chunk.embedding = {
        modelo: EMBEDDING_MODEL,
        dimensiones: vectores[indice].length,
        vector: vectores[indice],
        generado,
      };
    });

    for (const ruta of new Set(lote.map((p) => p.ruta))) {
      escribir(ruta, archivos.get(ruta)!);
    }
  }

  const dimensiones = new Set(
    [...archivos.values()].flatMap((a) =>
      a.chunks.map((c) => c.embedding.dimensiones).filter(Boolean),
    ),
  );

  console.log(`listo. modelo ${EMBEDDING_MODEL}, dimensiones ${[...dimensiones].join(", ")}`);

  if (!dimensiones.has(EMBEDDING_DIMENSIONS)) {
    console.log(`AVISO: la tabla espera ${EMBEDDING_DIMENSIONS} dimensiones`);
  }
}

main();
