import { tool } from "ai";
import { z } from "zod";

import { buscar } from "./busqueda";

export function buildChatTools(planId: string) {
  return {
    buscar: tool({
      description: `Busca por significado en la base de conocimiento. Es tu unica fuente: si algo no aparece aqui, no lo sabes.

Elige el tipo segun lo que necesites:
- sintoma: para pasar de lo que describe el paciente a una especialidad. Usa sus mismas palabras, no las traduzcas a terminologia medica.
- cobertura: copago, coaseguro y requisitos de una especialidad en un hospital concreto. Nombra la especialidad, no el sintoma.
- ranking: que hospital sale mas barato. Devuelve la comparativa ya ordenada.
- condicion: carencias, exclusiones, preexistencias, referencias, preautorizaciones, urgencias y que cubre un plan en general.
- hospital: direccion, horarios y especialidades de un centro.

Elige el alcance:
- mi_plan: lo que le aplica a este paciente. Usalo siempre que la pregunta sea sobre lo suyo.
- todos_los_planes: solo para comparar con otros planes que el paciente no tiene. Cada resultado viene marcado con su plan en el campo plan y con esSuPlan.

Devuelve una muestra ordenada por parecido, no un catalogo completo: que vuelvan pocos resultados no significa que no haya mas. Llamala tantas veces como haga falta y reformula si lo que vuelve no responde.`,
      inputSchema: z.object({
        consulta: z
          .string()
          .describe("Lo que quieres encontrar, redactado como una frase"),
        tipo: z
          .enum(["sintoma", "cobertura", "ranking", "condicion", "hospital"])
          .describe("Que clase de informacion buscas"),
        alcance: z
          .enum(["mi_plan", "todos_los_planes"])
          .describe("mi_plan para lo que le aplica, todos_los_planes solo para comparar"),
      }),
      execute: ({ consulta, tipo, alcance }) =>
        buscar({ consulta, tipo, alcance, planId }),
    }),
  };
}
