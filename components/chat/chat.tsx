"use client";

import { useChat } from "@ai-sdk/react";

import type { ChatMessage } from "@/lib/ai/types";

import { ChatComposer } from "./chat-composer";
import { MessageList } from "./message-list";

export function Chat() {
  const { messages, sendMessage, status, error } = useChat<ChatMessage>();
  const isBusy = status === "submitted" || status === "streaming";

  return (
    <div className="mx-auto flex h-dvh w-full max-w-2xl flex-col">
      <MessageList messages={messages} isBusy={isBusy} />
      {error ? (
        <p role="alert" className="px-4 pb-2 text-sm text-red-600">
          No se pudo completar la respuesta. Intentalo de nuevo.
        </p>
      ) : null}
      <ChatComposer
        onSubmit={(text) => sendMessage({ text })}
        disabled={isBusy}
      />
    </div>
  );
}
