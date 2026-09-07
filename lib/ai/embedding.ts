import { embed, embedMany } from "ai";
import { cosineDistance, desc, gt, sql } from "drizzle-orm";

import { db } from "@/lib/db";
import { embeddings } from "@/lib/db/schema/embeddings";

import { chunkContent } from "./chunking";
import { EMBEDDING_MODEL } from "./models";

const SIMILARITY_THRESHOLD = 0.3;
const MAX_RESULTS = 4;

export type EmbeddedChunk = {
  content: string;
  embedding: number[];
};

export type RelevantChunk = {
  content: string;
  similarity: number;
};

export async function embedContent(content: string): Promise<EmbeddedChunk[]> {
  const chunks = chunkContent(content);

  if (chunks.length === 0) {
    return [];
  }

  const { embeddings: vectors } = await embedMany({
    model: EMBEDDING_MODEL,
    values: chunks,
  });

  return vectors.map((embedding, index) => ({
    content: chunks[index],
    embedding,
  }));
}

export async function embedQuery(query: string): Promise<number[]> {
  const { embedding } = await embed({
    model: EMBEDDING_MODEL,
    value: query.replaceAll("\n", " "),
  });

  return embedding;
}

export async function findRelevantContent(
  query: string,
): Promise<RelevantChunk[]> {
  const queryEmbedding = await embedQuery(query);
  const similarity = sql<number>`1 - (${cosineDistance(embeddings.embedding, queryEmbedding)})`;

  return db
    .select({ content: embeddings.content, similarity })
    .from(embeddings)
    .where(gt(similarity, SIMILARITY_THRESHOLD))
    .orderBy((row) => desc(row.similarity))
    .limit(MAX_RESULTS);
}
