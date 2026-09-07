import type { InferUITools, UIDataTypes, UIMessage } from "ai";

import type { buildChatTools } from "./tools";

export type ChatTools = InferUITools<ReturnType<typeof buildChatTools>>;

export type ChatMessage = UIMessage<never, UIDataTypes, ChatTools>;
