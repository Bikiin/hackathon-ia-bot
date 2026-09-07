import type { InferUITools, UIDataTypes, UIMessage } from "ai";

import type { chatTools } from "./tools";

export type ChatTools = InferUITools<typeof chatTools>;

export type ChatMessage = UIMessage<never, UIDataTypes, ChatTools>;

export type ChatToolName = `tool-${keyof ChatTools & string}`;
