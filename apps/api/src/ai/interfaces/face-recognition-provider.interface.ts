export interface FaceMatchResult {
  matched: boolean;
  employeeId?: string;
  confidence: number;
}

/**
 * Provider-agnostic contract for face enrollment/recognition.
 * Swap MockFaceRecognitionProvider for a real SDK (AWS Rekognition,
 * Azure Face, etc.) by rebinding this token in AiModule.
 */
export const FACE_RECOGNITION_PROVIDER = 'FACE_RECOGNITION_PROVIDER';

export interface FaceRecognitionProvider {
  enroll(employeeId: string, photoUrl: string): Promise<{ faceEmbeddingId: string }>;
  recognize(photoUrl: string): Promise<FaceMatchResult>;
}
