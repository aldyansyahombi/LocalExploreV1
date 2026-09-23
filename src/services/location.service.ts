import { Geolocation } from "@capacitor/geolocation";
import { Capacitor } from "@capacitor/core";

export interface CurrentLocation {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

export async function getCurrentLocation(): Promise<CurrentLocation> {
  // =========================================
  // WEB
  // =========================================

  if (Capacitor.getPlatform() === "web") {
    if (!navigator.geolocation) {
      throw new Error(
        "Browser tidak mendukung geolocation."
      );
    }

    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
          });
        },
        (error) => {
          let message = "Gagal mendapatkan lokasi.";

          switch (error.code) {
            case error.PERMISSION_DENIED:
              message = "Izin lokasi ditolak oleh browser.";
              break;

            case error.POSITION_UNAVAILABLE:
              message = "Lokasi tidak tersedia.";
              break;

            case error.TIMEOUT:
              message = "Waktu pengambilan lokasi habis.";
              break;
          }

          reject(new Error(message));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 30000,
        }
      );
    });
  }

  // =========================================
  // ANDROID
  // =========================================

  const permission = await Geolocation.checkPermissions();

  if (permission.location !== "granted") {
    const requested = await Geolocation.requestPermissions();

    if (requested.location !== "granted") {
      throw new Error("Izin lokasi tidak diberikan.");
    }
  }

  const position = await Geolocation.getCurrentPosition({
    enableHighAccuracy: true,
    timeout: 10000,
    maximumAge: 30000,
  });

  return {
    latitude: position.coords.latitude,
    longitude: position.coords.longitude,
    accuracy: position.coords.accuracy,
  };
}