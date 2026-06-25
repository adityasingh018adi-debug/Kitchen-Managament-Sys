/**
 * Provider-agnostic contract for the AI assistant chat. Swap
 * MockAssistantProvider for an OpenAI/Gemini-backed implementation by
 * binding a different class to this token in AiModule — nothing else in
 * the codebase needs to change.
 */
export const ASSISTANT_PROVIDER = 'ASSISTANT_PROVIDER';

export interface AssistantProvider {
  ask(question: string, context: Record<string, unknown>): Promise<{ answer: string }>;
}
