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
      return "entertainment.museum";

    default:
      return "tourism.sights";
  }
}


export async function syncPlaces(
  options: PlaceSearchOptions
): Promise<Place[]> {
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
}