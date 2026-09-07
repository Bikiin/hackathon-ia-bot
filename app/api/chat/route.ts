import {
  convertToModelMessages,
  createUIMessageStreamResponse,
  isStepCount,
  streamText,
  toUIMessageStream,
} from "ai";

import { CHAT_MODEL, CHAT_PROVIDER_OPTIONS } from "@/lib/ai/models";
import { CHAT_INSTRUCTIONS } from "@/lib/ai/prompts";
import { buildChatTools } from "@/lib/ai/tools";
import type { ChatMessage } from "@/lib/ai/types";
import { obtenerPaciente } from "@/lib/db/consultas";

export const maxDuration = 30;

const MAX_STEPS = 12;

type Peticion = {
  messages: ChatMessage[];
  pacienteId: string;
};

export async function POST(request: Request) {
  const { messages, pacienteId }: Peticion = await request.json();

  const paciente = await obtenerPaciente(pacienteId);

  if (!paciente) {
    return Response.json({ error: "Paciente no encontrado" }, { status: 400 });
  }

  const result = streamText({
    model: CHAT_MODEL,
    temperature: 0,
    providerOptions: CHAT_PROVIDER_OPTIONS,
    instructions: `${CHAT_INSTRUCTIONS}

Atiendes a ${paciente.nombre}, afiliado ${paciente.numeroAfiliado}, con ${paciente.plan}. Toda busqueda de cobertura, comparativa o condiciones se filtra sola por ese plan: no preguntes cual tiene ni aceptes que te digan otro.`,
    messages: await convertToModelMessages(messages),
    stopWhen: isStepCount(MAX_STEPS),
    tools: buildChatTools(paciente.planId),
  });

  return createUIMessageStreamResponse({
    stream: toUIMessageStream({ stream: result.stream }),
  });
}
