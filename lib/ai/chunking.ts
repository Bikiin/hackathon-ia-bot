const SENTENCE_BOUNDARY = /(?<=[.!?])\s+|\n{2,}/;

export function chunkContent(content: string): string[] {
  return content
    .split(SENTENCE_BOUNDARY)
    .map((chunk) => chunk.trim())
    .filter((chunk) => chunk.length > 0);
}
