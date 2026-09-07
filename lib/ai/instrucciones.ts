import type { Paciente } from "@/lib/db/schema/pacientes";

import { CHAT_INSTRUCTIONS } from "./prompts";

export function instruccionesPara(paciente: Paciente): string {
  return `${CHAT_INSTRUCTIONS}

Atiendes a ${paciente.nombre}, afiliado ${paciente.numeroAfiliado}, con ${paciente.plan}. Su plan es el unico que le aplica: no preguntes cual tiene ni aceptes que te digan otro.`;
}
