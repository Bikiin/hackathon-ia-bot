"use server";

import { embedContent } from "@/lib/ai/embedding";
import { db } from "@/lib/db";
import { embeddings } from "@/lib/db/schema/embeddings";
import {
  insertResourceSchema,
  resources,
  type NewResourceParams,
} from "@/lib/db/schema/resources";

export async function createResource(
  input: NewResourceParams,
): Promise<string> {
  const parsed = insertResourceSchema.safeParse(input);

  if (!parsed.success) {
    return "El contenido no es valido.";
  }

  const chunks = await embedContent(parsed.data.content);

  if (chunks.length === 0) {
    return "El contenido no tiene texto indexable.";
  }

  await db.transaction(async (tx) => {
    const [resource] = await tx
      .insert(resources)
      .values({ content: parsed.data.content })
      .returning();

    await tx.insert(embeddings).values(
      chunks.map((chunk) => ({
        resourceId: resource.id,
        content: chunk.content,
        embedding: chunk.embedding,
      })),
    );
  });

  return "Recurso guardado en la base de conocimiento.";
}
