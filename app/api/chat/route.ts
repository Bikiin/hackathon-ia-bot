import {
  convertToModelMessages,
  createUIMessageStreamResponse,
  isStepCount,
  streamText,
  toUIMessageStream,
} from "ai";

import { CHAT_MODEL } from "@/lib/ai/models";
import { CHAT_INSTRUCTIONS } from "@/lib/ai/prompts";
import { chatTools } from "@/lib/ai/tools";
import type { ChatMessage } from "@/lib/ai/types";

export const maxDuration = 30;

const MAX_STEPS = 5;

export async function POST(request: Request) {
  const { messages }: { messages: ChatMessage[] } = await request.json();

  const result = streamText({
    model: CHAT_MODEL,
    instructions: CHAT_INSTRUCTIONS,
    messages: await convertToModelMessages(messages),
    stopWhen: isStepCount(MAX_STEPS),
    tools: chatTools,
  });

  return createUIMessageStreamResponse({
    stream: toUIMessageStream({ stream: result.stream }),
  });
}
