import type { Place } from "../db/types";

const API_KEY = import.meta.env.VITE_GEOAPIFY_API_KEY;

const PLACES_URL = "https://api.geoapify.com/v2/places";
const GEOCODING_URL = "https://api.geoapify.com/v1/geocode/search";

export interface GeoapifySearchOptions {
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

export interface GeoapifyCity {
  name: string;

  country: string;

  countryCode: string;

  state?: string;

  latitude: number;

  longitude: number;

  placeId: string;
}

function checkApiKey() {
  if (!API_KEY) {
    throw new Error(
      "Geoapify API key belum dikonfigurasi."
    );
  }
}

/**
 * Mencari kota menggunakan Geoapify Geocoding API.
 *
 * Contoh:
 * geocodeCity("Kendari", "id")
 */
export async function geocodeCity(
  city: string,
  countryCode?: string
): Promise<GeoapifyCity | null> {
  checkApiKey();

  const params = new URLSearchParams();

  params.set("text", city);

  // Kita meminta hasil berupa kota
  params.set("type", "city");

  params.set("limit", "5");

  params.set("lang", "id");

  params.set("format", "json");

  // Kalau negara diberikan,
  // pencarian kota dibatasi ke negara tersebut.
  if (countryCode) {
    params.set(
      "filter",
      `countrycode:${countryCode.toLowerCase()}`
    );
  }

  params.set("apiKey", API_KEY);

  const response = await fetch(
    `${GEOCODING_URL}?${params.toString()}`
  );

  if (!response.ok) {
    const message = await response.text();

    console.error(
      "Geoapify Geocoding error:",
      message
    );

    throw new Error("Gagal mencari kota.");
  }

  const data = await response.json();

  const result = data.results?.[0];

  if (!result) {
    return null;
  }

  if (!result.place_id) {
    return null;
  }

  return {
    name:
      result.city ||
      result.name ||
      city,

    country:
      result.country ||
      "",

    countryCode:
      result.country_code ||
      countryCode ||
      "",

    state:
      result.state,

    latitude:
      Number(result.lat),

    longitude:
      Number(result.lon),

    placeId:
      result.place_id,
  };
}

/**
 * Mengambil tempat dari Geoapify.
 *
 * Mode pencarian:
 *
 * 1. city
 * 2. country
 * 3. GPS
 */
export async function fetchPlacesFromGeoapify(
  options: GeoapifySearchOptions
): Promise<Place[]> {
  checkApiKey();

  const {
    latitude,
    longitude,

    radius = 5000,

    category = "tourism.sights",

    categoryId = 1,

    countryCode,

    city,

    limit = 30,
    offset = 0,
  } = options;

  const params = new URLSearchParams();

  params.set(
    "categories",
    category
  );

  params.set(
    "limit",
    String(limit)
  );

  params.set("offset", String(offset));

  params.set(
    "lang",
    "id"
  );

  /*
   * =====================================
   * MODE 1 — KOTA
   * =====================================
   */

  if (city) {
    const cityResult =
      await geocodeCity(
        city,
        countryCode
      );

    if (!cityResult) {
      throw new Error(
        `Kota "${city}" tidak ditemukan.`
      );
    }

    /*
     * Geoapify memberikan place_id
     * untuk kota tersebut.
     *
     * Kemudian kita gunakan place_id
     * sebagai filter Places API.
     */
    params.set(
      "filter",
      `place:${cityResult.placeId}`
    );

    /*
     * Bias membuat hasil lebih relevan
     * terhadap koordinat kota.
     */
    params.set(
      "bias",
      `proximity:${cityResult.longitude},${cityResult.latitude}`
    );
  }

  /*
   * =====================================
   * MODE 2 — NEGARA
   * =====================================
   */

  else if (countryCode) {
    params.set(
      "filter",
      `countrycode:${countryCode.toLowerCase()}`
    );

    /*
     * Kalau GPS juga tersedia,
     * gunakan sebagai bias.
     */
    if (
      latitude !== undefined &&
      longitude !== undefined
    ) {
      params.set(
        "bias",
        `proximity:${longitude},${latitude}`
      );
    }
  }

  /*
   * =====================================
   * MODE 3 — GPS
   * =====================================
   */

  else if (
    latitude !== undefined &&
    longitude !== undefined
  ) {
    /*
     * Cari dalam radius tertentu
     * dari posisi pengguna.
     */
    params.set(
      "filter",
      `circle:${longitude},${latitude},${radius}`
    );

    /*
     * Prioritaskan tempat yang
     * paling dekat dengan pengguna.
     */
    params.set(
      "bias",
      `proximity:${longitude},${latitude}`
    );
  }

  /*
   * Tidak ada GPS,
   * tidak ada negara,
   * dan tidak ada kota.
   */
  else {
    throw new Error(
      "Lokasi pencarian belum ditentukan."
    );
  }

  params.set(
    "apiKey",
    API_KEY
  );

  const response = await fetch(
    `${PLACES_URL}?${params.toString()}`
  );

  if (!response.ok) {
    const message =
      await response.text();

    console.error(
      "Geoapify Places error:",
      message
    );

    throw new Error(
      "Gagal mengambil data tempat dari Geoapify."
    );
  }

  const data =
    await response.json();

  /*
   * Ubah response Geoapify
   * menjadi object Place milik aplikasi.
   */
  return (data.features ?? []).map(
    (feature: any): Place => {
      const properties =
        feature.properties ?? {};

      const coordinates =
        feature.geometry?.coordinates ?? [];

      return {
        name:
          properties.name ||
          properties.address_line1 ||
          "Tempat tanpa nama",

        categoryId,

        latitude:
          properties.lat ??
          coordinates[1],

        longitude:
          properties.lon ??
          coordinates[0],

        address:
          properties.formatted ||
          properties.address_line1 ||
          "",

        country:
          properties.country,

        countryCode:
          properties.country_code,

        state:
          properties.state,

        city:
          properties.city,

        description:
          properties.description ||
          undefined,

        image:
          properties.datasource?.raw?.image ||
          undefined,

        rating:
          properties.rating
            ? Number(properties.rating)
            : undefined,

        source:
          "geoapify",

        sourceId:
          properties.place_id,

        createdAt:
          new Date().toISOString(),
      };
    }
  );
}