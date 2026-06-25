export interface FoodInspectionResult {
  overallScore: number;
  presentationScore: number;
  accuracyScore: number;
  suggestions: string[];
  raw?: Record<string, unknown>;
}

/**
 * Provider-agnostic contract for AI food-quality inspection.
 * Swap MockVisionProvider for an OpenAI/Gemini Vision-backed implementation
 * by binding a different class to this token in AiModule — nothing else
 * in the codebase needs to change.
 */
export const VISION_PROVIDER = 'VISION_PROVIDER';

export interface VisionProvider {
  inspectFood(photoUrl: string, recipeName: string): Promise<FoodInspectionResult>;
}
