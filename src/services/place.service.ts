import { fetchPlacesFromGeoapify } from "./geoapify.service";
import {
  saveGeoapifyPlaces,
  getPlaceBySourceId
} from "./database.service";

import type { Place } from "../db/types";

export interface PlaceSearchOptions {
  latitude?: number;
  longitude?: number;

  radius?: number;

  category?: string;

  categoryId?: number;

  countryCode?: string;

  city?: string;
  name?: string;

  limit?: number;
  offset?: number;
}

/**
 * Mengambil tempat dari Geoapify,
 * kemudian menyimpannya ke IndexedDB.
 *
 * Return:
 * - hanya hasil pencarian saat ini
 * - bukan seluruh data places di IndexedDB
 */
export function getGeoapifyCategory(
  categoryId?: number
): string {
  switch (categoryId) {
    case 1:
      return "tourism.sights";

    case 2:
      return "leisure.park";

    case 3:
      return "catering";

    case 4:
      return "activity.community_center";

    case 5:
      return "entertainment.culture";

    case 6:
      return "entertainment";

    case 7:
      return "commercial";

    case 8:
      return "accommodation";

    case 9:
      return "education";

    case 10:
      return "healthcare";

    case 11:
      return "beach";

    case 12:
      return "activity.sport_club";

    default:
      return "tourism.sights";
  }
}


export async function syncPlaces(
  options: PlaceSearchOptions
): Promise<Place[]> {
  if (!navigator.onLine) {
    console.log("Offline mode: searching local places");
    return searchLocalPlaces(options);
  }

  try {
    const places =
      await fetchPlacesFromGeoapify(options);

    if (places.length === 0) {
      return [];
    }

    await saveGeoapifyPlaces(places);

    const savedPlaces: Place[] = [];

    for (const place of places) {
      if (!place.sourceId) {
        continue;
      }

      const savedPlace = await getPlaceBySourceId(
        place.sourceId
      );

      if (savedPlace) {
        savedPlaces.push(savedPlace);
      }
    }

    return savedPlaces;
  } catch (error) {
    console.error("Gagal sync online, mencoba offline fallback:", error);
    return searchLocalPlaces(options);
  }
}

export async function searchLocalPlaces(
  options: PlaceSearchOptions
): Promise<Place[]> {
  const { getAllPlaces } = await import("./database.service");
  const allPlaces = await getAllPlaces();
  
  let filtered = allPlaces;

  if (options.categoryId) {
    filtered = filtered.filter(p => p.categoryId === options.categoryId);
  }

  if (options.name) {
    const keyword = options.name.toLowerCase();
    filtered = filtered.filter(p => p.name.toLowerCase().includes(keyword));
  }

  if (options.city) {
    const city = options.city.toLowerCase();
    filtered = filtered.filter(p => p.city?.toLowerCase().includes(city));
  }
  
  if (options.latitude !== undefined && options.longitude !== undefined && options.radius) {
    filtered = filtered.filter(p => {
      const dist = getDistanceFromLatLonInKm(
        options.latitude!, options.longitude!,
        p.latitude, p.longitude
      ) * 1000;
      return dist <= options.radius!;
    });
  }

  const limit = options.limit || 30;
  const offset = options.offset || 0;

  return filtered.slice(offset, offset + limit);
}

function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  return d;
}

function deg2rad(deg: number) {
  return deg * (Math.PI / 180);
}
