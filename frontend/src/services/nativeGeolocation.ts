import { Capacitor } from '@capacitor/core';
import { Geolocation, Position } from '@capacitor/geolocation';

export interface GeoCoordinates {
  latitude: number;
  longitude: number;
  accuracy?: number;
  altitude?: number | null;
}

export const nativeGeolocation = {
  isNative: () => Capacitor.isNativePlatform(),

  /**
   * Get current GPS position with high accuracy
   */
  getCurrentPosition: async (): Promise<GeoCoordinates> => {
    try {
      const position: Position = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 3000,
      });

      return {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        altitude: position.coords.altitude,
      };
    } catch (error) {
      console.error('Error obtaining GPS location:', error);
      throw error;
    }
  },

  /**
   * Check or request location permissions
   */
  checkPermissions: async () => {
    try {
      return await Geolocation.checkPermissions();
    } catch (error) {
      console.error('Error checking location permissions:', error);
      return null;
    }
  },
};
