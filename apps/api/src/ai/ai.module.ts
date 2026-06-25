import { Module } from '@nestjs/common';
import { VISION_PROVIDER } from './interfaces/vision-provider.interface';
import { FACE_RECOGNITION_PROVIDER } from './interfaces/face-recognition-provider.interface';
import { MockVisionProvider } from './providers/mock-vision.provider';
import { MockFaceRecognitionProvider } from './providers/mock-face-recognition.provider';

@Module({
  providers: [
    { provide: VISION_PROVIDER, useClass: MockVisionProvider },
    { provide: FACE_RECOGNITION_PROVIDER, useClass: MockFaceRecognitionProvider },
  ],
  exports: [VISION_PROVIDER, FACE_RECOGNITION_PROVIDER],
})
export class AiModule {}
