"use client";

import { useChat } from "@ai-sdk/react";
import { useState } from "react";

import type { ChatMessage } from "@/lib/ai/types";
import type { Paciente } from "@/lib/db/schema/pacientes";

import { ChatComposer } from "./chat-composer";
import { MessageList } from "./message-list";
import { SelectorPaciente } from "./selector-paciente";

type ChatProps = {
  pacientes: Paciente[];
};

export function Chat({ pacientes }: ChatProps) {
  const [pacienteId, setPacienteId] = useState(pacientes[0]?.id ?? "");
  const { messages, sendMessage, status, error, setMessages } =
    useChat<ChatMessage>();

  const isBusy = status === "submitted" || status === "streaming";

  function cambiarPaciente(id: string) {
    setPacienteId(id);
    setMessages([]);
  }

  return (
    <div className="mx-auto flex h-dvh w-full max-w-2xl flex-col">
      <SelectorPaciente
        pacientes={pacientes}
        valor={pacienteId}
        onChange={cambiarPaciente}
        disabled={isBusy}
      />
      <MessageList messages={messages} isBusy={isBusy} />
      {error ? (
        <p role="alert" className="px-4 pb-2 text-sm text-red-600">
          {error.message || "No se pudo completar la respuesta."}
        </p>
      ) : null}
      <ChatComposer
        onSubmit={(text) => sendMessage({ text }, { body: { pacienteId } })}
        disabled={isBusy || pacienteId === ""}
      />
    </div>
  );
}
