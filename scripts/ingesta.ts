import { createHash } from "node:crypto";
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

import {
  chunksDeHospital,
  chunksDePoliza,
  chunksDeSintomas,
  leerCatalogoHospital,
  type CatalogoHospital,
} from "@/lib/ingesta/generadores";
import { leerFrontmatter } from "@/lib/ingesta/markdown";
import type {
  ArchivoChunks,
  ArchivoProcesado,
  Chunk,
  DocumentoMeta,
  Familia,
} from "@/lib/ingesta/tipos";

const RAIZ = "documentos";
const INSUMOS = join(RAIZ, "insumos");
const CHUNKS = join(RAIZ, "chunks");
const PROCESSED = join(RAIZ, "processed");
const GENERADO = new Date().toISOString();

function archivosDe(familia: Familia): string[] {
  return readdirSync(join(INSUMOS, familia))
    .filter((archivo) => archivo.endsWith(".md"))
    .sort();
}

function meta(familia: Familia, archivo: string, md: string): DocumentoMeta {
  return {
    familia,
    archivo,
    ruta: join(INSUMOS, familia, archivo),
    hash: `sha256:${createHash("sha256").update(md).digest("hex").slice(0, 16)}`,
    frontmatter: leerFrontmatter(md),
    generado: GENERADO,
  };
}

function textoEmbebible(chunk: Chunk, documento: DocumentoMeta): string {
  const campos = Object.entries(chunk.metadata)
    .map(([clave, valor]) => `${clave}: ${valor}`)
    .join(" | ");

  return `<tipo: ${chunk.tipo} | ${campos} | documento: ${documento.archivo}>\n${chunk.contenido}`;
}

function escribir(ruta: string, contenido: unknown): void {
  mkdirSync(dirname(ruta), { recursive: true });
  writeFileSync(ruta, `${JSON.stringify(contenido, null, 2)}\n`);
}

function guardar(documento: DocumentoMeta, chunks: Chunk[]): number {
  const base = documento.archivo.replace(/\.md$/, ".json");

  const porTipo = chunks.reduce<Record<string, number>>((acumulado, chunk) => {
    acumulado[chunk.tipo] = (acumulado[chunk.tipo] ?? 0) + 1;
    return acumulado;
  }, {});

  const archivoChunks: ArchivoChunks = {
    documento,
    total: chunks.length,
    porTipo,
    chunks,
  };

  const archivoProcesado: ArchivoProcesado = {
    documento,
    total: chunks.length,
    embeddingsPendientes: chunks.length,
    chunks: chunks.map((chunk) => {
      const texto = textoEmbebible(chunk, documento);

      return {
        ...chunk,
        textoEmbebible: texto,
        caracteres: texto.length,
        embedding: {
          modelo: null,
          dimensiones: null,
          vector: null,
          generado: null,
        },
      };
    }),
  };

  escribir(join(CHUNKS, documento.familia, base), archivoChunks);
  escribir(join(PROCESSED, documento.familia, base), archivoProcesado);

  return chunks.length;
}

function main(): void {
  const catalogos: CatalogoHospital[] = [];
  let total = 0;

  for (const archivo of archivosDe("hospitales")) {
    const ruta = join(INSUMOS, "hospitales", archivo);
    const md = readFileSync(ruta, "utf8");
    catalogos.push(leerCatalogoHospital(md, ruta));
    total += guardar(meta("hospitales", archivo, md), chunksDeHospital(md, ruta));
  }

  for (const archivo of archivosDe("polizas")) {
    const ruta = join(INSUMOS, "polizas", archivo);
    const md = readFileSync(ruta, "utf8");
    total += guardar(
      meta("polizas", archivo, md),
      chunksDePoliza(md, ruta, catalogos),
    );
  }

  for (const archivo of archivosDe("clinico")) {
    const ruta = join(INSUMOS, "clinico", archivo);
    const md = readFileSync(ruta, "utf8");
    total += guardar(meta("clinico", archivo, md), chunksDeSintomas(md, ruta));
  }

  console.log(`${total} chunks escritos en ${CHUNKS} y ${PROCESSED}`);
}

main();
