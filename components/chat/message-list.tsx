"use client";

import { useEffect, useRef } from "react";

import type { ChatMessage } from "@/lib/ai/types";

import { MessageBubble } from "./message-bubble";

type MessageListProps = {
  messages: ChatMessage[];
  isBusy: boolean;
};

export function MessageList({ messages, isBusy }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isBusy]);

  if (messages.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center px-4">
        <p className="max-w-sm text-center text-sm text-zinc-500">
          Cuentame algo para que lo guarde, o preguntame por algo que ya te haya
          guardado.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 overflow-y-auto px-4 py-6">
      {messages.map((message) => (
        <MessageBubble key={message.id} message={message} />
      ))}
      {isBusy ? <p className="text-xs text-zinc-500">Pensando...</p> : null}
      <div ref={bottomRef} />
    </div>
  );
}
