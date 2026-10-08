import { Capacitor } from '@capacitor/core';
import { Camera, CameraResultType, CameraSource, Photo } from '@capacitor/camera';

export interface CapturedImage {
  file: File;
  previewUrl: string;
  format: string;
}

/**
 * Helper to convert base64 / dataUrl / blob URL from Capacitor to a standard File object
 */
async function photoToFile(photo: Photo, defaultName = 'captured_plant.jpg'): Promise<File> {
  const response = await fetch(photo.webPath || photo.dataUrl || '');
  const blob = await response.blob();
  const mimeType = photo.format ? `image/${photo.format}` : 'image/jpeg';
  return new File([blob], defaultName, { type: mimeType });
}

export const nativeCamera = {
  isNative: () => Capacitor.isNativePlatform(),

  /**
   * Capture a new photo using the device camera
   */
  takePhoto: async (): Promise<CapturedImage | null> => {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Uri,
        source: CameraSource.Camera,
      });

      if (!image.webPath) return null;

      const file = await photoToFile(image, `scan_${Date.now()}.${image.format || 'jpg'}`);
      return {
        file,
        previewUrl: image.webPath,
        format: image.format,
      };
    } catch (error: any) {
      // User cancelled or camera permission denied
      if (error?.message?.includes('User cancelled')) {
        return null;
      }
      console.error('Error capturing photo with Camera plugin:', error);
      throw error;
    }
  },

  /**
   * Pick an image from gallery/photos
   */
  pickImage: async (): Promise<CapturedImage | null> => {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Uri,
        source: CameraSource.Photos,
      });

      if (!image.webPath) return null;

      const file = await photoToFile(image, `gallery_${Date.now()}.${image.format || 'jpg'}`);
      return {
        file,
        previewUrl: image.webPath,
        format: image.format,
      };
    } catch (error: any) {
      if (error?.message?.includes('User cancelled')) {
        return null;
      }
      console.error('Error picking image from Gallery:', error);
      throw error;
    }
  },
};
