import { Chat } from "@/components/chat/chat";
import { listarPacientes } from "@/lib/db/consultas";

export const dynamic = "force-dynamic";

export default async function Page() {
  const pacientes = await listarPacientes();

  return (
    <main>
      <Chat pacientes={pacientes} />
    </main>
  );
}
