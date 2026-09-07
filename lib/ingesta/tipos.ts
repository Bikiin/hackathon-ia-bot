export type Familia = "hospitales" | "polizas" | "clinico";

export type TipoChunk =
  | "hospital"
  | "cobertura"
  | "ranking"
  | "condicion"
  | "sintoma";

export type Fuente = {
  ruta: string;
  seccion: string;
};

export type Metadata = Record<string, string | number | boolean>;

export type Chunk = {
  id: string;
  tipo: TipoChunk;
  metadata: Metadata;
  contenido: string;
  fuentes: Fuente[];
};

export type DocumentoMeta = {
  familia: Familia;
  archivo: string;
  ruta: string;
  hash: string;
  frontmatter: Record<string, string>;
  generado: string;
};

export type ArchivoChunks = {
  documento: DocumentoMeta;
  total: number;
  porTipo: Record<string, number>;
  chunks: Chunk[];
};

export type ResultadoEmbedding = {
  modelo: string | null;
  dimensiones: number | null;
  vector: number[] | null;
  generado: string | null;
};

export type ChunkProcesado = Chunk & {
  textoEmbebible: string;
  caracteres: number;
  embedding: ResultadoEmbedding;
};

export type ArchivoProcesado = {
  documento: DocumentoMeta;
  total: number;
  embeddingsPendientes: number;
  chunks: ChunkProcesado[];
};
