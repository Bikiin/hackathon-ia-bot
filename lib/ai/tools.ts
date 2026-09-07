import { tool } from "ai";
import { z } from "zod";

import { createResource } from "@/lib/actions/resources";

import { findRelevantContent } from "./embedding";

export const chatTools = {
  addResource: tool({
    description:
      "Guarda informacion nueva en la base de conocimiento. Usalo cuando el usuario aporte un dato que deba recordarse.",
    inputSchema: z.object({
      content: z.string().describe("El contenido que hay que guardar"),
    }),
    execute: ({ content }) => createResource({ content }),
  }),
  getInformation: tool({
    description:
      "Busca en la base de conocimiento la informacion necesaria para responder una pregunta.",
    inputSchema: z.object({
      question: z.string().describe("La pregunta del usuario"),
    }),
    execute: ({ question }) => findRelevantContent(question),
  }),
};
