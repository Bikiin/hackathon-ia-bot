import { tool } from "ai";
import { z } from "zod";

import { buscar } from "./busqueda";

const TIPOS = z.enum(["sintoma", "cobertura", "ranking", "condicion", "hospital"]);

export function buildChatTools(planId: string) {
  return {
    buscar: tool({
      description: `Busca por significado en la base de conocimiento del paciente. Es tu unica fuente: si algo no aparece aqui, no lo sabes.

Elige el tipo segun lo que necesites en ese momento:
- sintoma: para pasar de lo que describe el paciente a una especialidad. Busca con sus mismas palabras.
- cobertura: para el copago, el coaseguro y los requisitos de una especialidad en un hospital concreto. Busca nombrando la especialidad, no el sintoma.
- ranking: para saber que hospital sale mas barato. Devuelve la comparativa ya ordenada.
- condicion: para carencias, exclusiones, preexistencias, referencias, preautorizaciones y urgencias.
- hospital: para direccion, horarios y que especialidades atiende un centro.

Los tipos cobertura, ranking y condicion se filtran solos por el plan del paciente. Llamala tantas veces como haga falta y reformula la consulta si lo que vuelve no responde a lo que buscas.`,
      inputSchema: z.object({
        consulta: z
          .string()
          .describe("Lo que quieres encontrar, redactado como una frase"),
        tipo: TIPOS.describe("Que clase de informacion buscas"),
      }),
      execute: ({ consulta, tipo }) => buscar({ consulta, tipo, planId }),
    }),
  };
}

export type ChatTools = ReturnType<typeof buildChatTools>;
