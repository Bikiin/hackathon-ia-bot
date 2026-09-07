import type { ChatToolName } from "@/lib/ai/types";

const TOOL_LABELS: Record<ChatToolName, string> = {
  "tool-addResource": "Guardando en la base de conocimiento",
  "tool-getInformation": "Consultando la base de conocimiento",
};

type ToolCallProps = {
  name: ChatToolName;
  isComplete: boolean;
};

export function ToolCall({ name, isComplete }: ToolCallProps) {
  const label = TOOL_LABELS[name];

  return (
    <p className="text-xs text-zinc-500">
      {isComplete ? `${label}: listo` : `${label}...`}
    </p>
  );
}
