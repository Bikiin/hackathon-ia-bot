import { asc, eq } from "drizzle-orm";

import { db } from "./index";
import { pacientes, type Paciente } from "./schema/pacientes";

export async function listarPacientes(): Promise<Paciente[]> {
  return db.select().from(pacientes).orderBy(asc(pacientes.nombre));
}

export async function obtenerPaciente(id: string): Promise<Paciente | null> {
  const [paciente] = await db
    .select()
    .from(pacientes)
    .where(eq(pacientes.id, id))
    .limit(1);

  return paciente ?? null;
}
