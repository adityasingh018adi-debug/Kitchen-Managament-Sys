import { Injectable } from '@nestjs/common';
import { FoodInspectionResult, VisionProvider } from '../interfaces/vision-provider.interface';

/**
 * Deterministic placeholder so the inspection flow (UI, storage, reports)
 * is fully exercisable without an OpenAI/Gemini Vision API key. Replace
 * with a real provider once credentials are available.
 */
@Injectable()
export class MockVisionProvider implements VisionProvider {
  async inspectFood(photoUrl: string, recipeName: string): Promise<FoodInspectionResult> {
    return {
      overallScore: 85,
      presentationScore: 88,
      accuracyScore: 90,
      suggestions: [
        `Mock inspection for "${recipeName}" — connect a real vision provider for live scoring.`,
      ],
      raw: { photoUrl, mock: true },
    };
  }
}
