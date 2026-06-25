import { Injectable } from '@nestjs/common';
import { AssistantProvider } from '../interfaces/assistant-provider.interface';

/**
 * Deterministic placeholder so the assistant chat UI is fully exercisable
 * without an OpenAI/Gemini API key. Echoes the live analytics context back
 * instead of generating free-form text. Replace with a real LLM-backed
 * provider once credentials are available.
 */
@Injectable()
export class MockAssistantProvider implements AssistantProvider {
  async ask(question: string, context: Record<string, unknown>): Promise<{ answer: string }> {
    return {
      answer:
        `[Mock assistant — connect a real LLM provider for live answers]\n\n` +
        `You asked: "${question}"\n\n` +
        `Current kitchen snapshot: ${JSON.stringify(context, null, 2)}`,
    };
  }
}
