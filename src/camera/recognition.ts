import { RecognitionResult } from './types';

export async function recognizeGraphFromImage(imageDataUrl: string): Promise<RecognitionResult> {
  // Simulate processing time
  await new Promise(resolve => setTimeout(resolve, 1500));

  // The project does not currently have a real computer-vision/OCR recognition mechanism available.
  // We must return a clear failure state instead of pretending the image was successfully interpreted.
  return {
    status: 'UNAVAILABLE',
    message: 'Graph recognition is not available.'
  };
}
