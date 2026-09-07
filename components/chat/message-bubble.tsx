import type { ChatMessage } from "@/lib/ai/types";

import { ToolCall } from "./tool-call";

const ROLE_LABELS: Record<ChatMessage["role"], string> = {
  system: "Sistema",
  user: "Tu",
  assistant: "Asistente",
};

type MessageBubbleProps = {
  message: ChatMessage;
};

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user";

  return (
    <article className="space-y-1">
      <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
        {ROLE_LABELS[message.role]}
      </p>
      <div
        className={
          isUser
            ? "rounded-lg bg-zinc-900 px-3 py-2 text-sm text-zinc-50"
            : "space-y-2 rounded-lg bg-zinc-100 px-3 py-2 text-sm text-zinc-900"
        }
      >
        {message.parts.map((part, index) => {
          if (part.type === "text") {
            return (
              <p key={index} className="whitespace-pre-wrap">
                {part.text}
              </p>
            );
          }

          if (part.type === "tool-buscar") {
            return (
              <ToolCall
                key={index}
                tipo={part.input?.tipo}
                consulta={part.input?.consulta}
                resultados={
                  part.state === "output-available"
                    ? part.output.length
                    : undefined
                }
                error={part.state === "output-error"}
              />
            );
          }

          return null;
        })}
      </div>
    </article>
  );
}
