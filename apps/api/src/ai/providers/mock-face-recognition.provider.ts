import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import {
  FaceMatchResult,
  FaceRecognitionProvider,
} from '../interfaces/face-recognition-provider.interface';

/**
 * Placeholder so enrollment/attendance flows work end-to-end without a real
 * face-recognition SDK. Replace with AWS Rekognition / Azure Face / etc.
 */
@Injectable()
export class MockFaceRecognitionProvider implements FaceRecognitionProvider {
  async enroll(): Promise<{ faceEmbeddingId: string }> {
    return { faceEmbeddingId: randomUUID() };
  }

  async recognize(): Promise<FaceMatchResult> {
    return { matched: false, confidence: 0 };
  }
}
