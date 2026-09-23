<template>
  <ion-page>
    <!-- HEADER -->
    <ion-header>
      <ion-toolbar>
        <ion-title>Jelajahi</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">

      <!-- SEARCH -->
      <ion-searchbar
        v-model="searchQuery"
        placeholder="Cari tempat..."
        :disabled="loading"
        @keyup.enter="handleSearch"
      />

      <!-- LOCATION MODE -->
      <ion-card>
        <ion-card-header>
          <ion-card-title>
            📍 Pilih lokasi
          </ion-card-title>
        </ion-card-header>

        <ion-card-content>

          <ion-segment v-model="locationMode">
            <ion-segment-button value="current">
              <ion-label>Lokasi Saya</ion-label>
            </ion-segment-button>

            <ion-segment-button value="manual">
              <ion-label>Pilih Kota</ion-label>
            </ion-segment-button>
          </ion-segment>

          <!-- CURRENT LOCATION -->
          <div
            v-if="locationMode === 'current'"
            class="location-section"
          >
            <p>
              Cari tempat menarik di sekitar lokasi kamu.
            </p>

            <ion-button
              expand="block"
              :disabled="loading"
              @click="searchNearby"
            >
              <ion-spinner
                v-if="loading"
                name="crescent"
              />

              <span v-else>
                📍 Gunakan lokasi saya
              </span>
            </ion-button>
          </div>

          <!-- MANUAL LOCATION -->
          <div
            v-else
            class="location-section"
          >
            <ion-item>
              <ion-label position="stacked">
                Negara
              </ion-label>

              <ion-select
                v-model="selectedCountry"
                interface="popover"
              >
                <ion-select-option value="id">
                  🇮🇩 Indonesia
                </ion-select-option>

                <ion-select-option value="my">
                  🇲🇾 Malaysia
                </ion-select-option>

                <ion-select-option value="sg">
                  🇸🇬 Singapore
                </ion-select-option>

                <ion-select-option value="jp">
                  🇯🇵 Jepang
                </ion-select-option>

                <ion-select-option value="us">
                  🇺🇸 Amerika Serikat
                </ion-select-option>

                <ion-select-option value="au">
                  🇦🇺 Australia
                </ion-select-option>
              </ion-select>
            </ion-item>

            <ion-item>
              <ion-label position="stacked">
                Kota
              </ion-label>

              <ion-input
                v-model="cityQuery"
                placeholder="Contoh: Kendari"
                @keyup.enter="searchByCity"
              />
            </ion-item>

            <ion-button
              expand="block"
              :disabled="
                loading ||
                !cityQuery.trim()
              "
              @click="searchByCity"
            >
              <ion-spinner
                v-if="loading"
                name="crescent"
              />

              <span v-else>
                🔎 Cari tempat
              </span>
            </ion-button>
          </div>

        </ion-card-content>
      </ion-card>

      <!-- CATEGORY -->
      <ion-card>
        <ion-card-header>
          <ion-card-title>
            🏷️ Kategori
          </ion-card-title>
        </ion-card-header>

        <ion-card-content>

          <ion-select
            v-model="selectedCategoryId"
            interface="popover"
            placeholder="Semua kategori"
            @ionChange="handleCategoryChange"
          >
            <ion-select-option
              :value="undefined"
            >
              Semua kategori
            </ion-select-option>

            <ion-select-option
              v-for="category in categories"
              :key="category.id"
              :value="category.id"
            >
              {{ category.icon }}
              {{ category.name }}
            </ion-select-option>
          </ion-select>

        </ion-card-content>
      </ion-card>

      <!-- ERROR -->
      <ion-text
        v-if="errorMessage"
        color="danger"
      >
        <p class="error-message">
          {{ errorMessage }}
        </p>
      </ion-text>

      <!-- LOADING -->
      <div
        v-if="loading"
        class="loading-container"
      >
        <ion-spinner />
        <p>Mencari tempat...</p>
      </div>

      <!-- RESULT HEADER -->
      <div
        v-if="!loading && places.length > 0"
        class="result-header"
      >
        <h2>Tempat ditemukan</h2>

        <span>
          {{ places.length }} tempat
        </span>
      </div>

      <!-- RESULTS -->
      <div
        v-if="!loading && places.length > 0"
        class="places-list"
      >
        <ion-card
          v-for="place in places"
          :key="
            place.sourceId ||
            place.id ||
            `${place.latitude}-${place.longitude}`
          "
          button
          @click="openDetail(place)"
        >
          <ion-card-content>

            <div class="place-content">

              <div class="place-icon">
                📍
              </div>

              <div class="place-info">

                <h3>
                  {{ place.name }}
                </h3>

                <p>
                  {{
                    place.city ||
                    "Lokasi tidak diketahui"
                  }}

                  <span
                    v-if="place.country"
                  >
                    , {{ place.country }}
                  </span>
                </p>

                <p
                  v-if="place.address"
                  class="address"
                >
                  {{ place.address }}
                </p>

                <p
                  v-if="place.rating"
                  class="rating"
                >
                  ⭐ {{ place.rating }}
                </p>

              </div>

            </div>

          </ion-card-content>
        </ion-card>
      </div>
      <!-- LOAD MORE -->

<div
  v-if="
    !loading &&
    places.length > 0 &&
    hasMore
  "
  class="load-more-container"
>
  <ion-button
    fill="outline"
    expand="block"
    :disabled="loadingMore"
    @click="loadMore"
  >
    <ion-spinner
      v-if="loadingMore"
      name="crescent"
    />

    <span v-else>
      Lihat lainnya
    </span>
  </ion-button>
</div>

      <!-- EMPTY STATE -->
      <ion-text
        v-if="
          !loading &&
          hasSearched &&
          places.length === 0 &&
          !errorMessage
        "
      >
        <div class="empty-state">
          <div class="empty-icon">
            🔎
          </div>

          <h3>
            Tidak ada tempat ditemukan
          </h3>

          <p>
            Coba gunakan kota, kategori,
            atau lokasi yang berbeda.
          </p>
        </div>
      </ion-text>

    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";

import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonSearchbar,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonButton,
  IonSpinner,
  IonItem,
  IonSelect,
  IonSelectOption,
  IonInput,
  IonText,
} from "@ionic/vue";

import type {
  Category,
  Place,
} from "@/db/types";

import {
  getAllCategories,
} from "@/services/database.service";

import {
  getCurrentLocation,
} from "@/services/location.service";

import {
  syncPlaces,
  getGeoapifyCategory,
} from "@/services/place.service";

/* =================================
   ROUTER
================================= */

const router = useRouter();
const route = useRoute();

/* =================================
   DATA
================================= */

const categories = ref<Category[]>([]);
const places = ref<Place[]>([]);

/* =================================
   SEARCH
================================= */

const searchQuery = ref("");

/* =================================
   LOCATION
================================= */

const locationMode =
  ref<"current" | "manual">("current");

const selectedCountry = ref("id");

const cityQuery = ref("");

/* =================================
   CATEGORY
================================= */

const selectedCategoryId =
  ref<number | undefined>(undefined);

/* =================================
   STATE
================================= */

const loading = ref(false);

const loadingMore = ref(false);

const errorMessage = ref("");

const hasSearched = ref(false);

const offset = ref(0);

const page = ref(1);

const hasMore = ref(true);

const PAGE_SIZE = 30;

/* =================================
   LOAD CATEGORIES
================================= */

async function loadCategories() {
  try {
    categories.value =
      await getAllCategories();
  } catch (error) {
    console.error(
      "Gagal memuat kategori:",
      error
    );
  }
}

function mergePlaces(
  current: Place[],
  incoming: Place[]
): Place[] {
  const map = new Map<string, Place>();

  for (const place of current) {
    const key =
      place.sourceId ||
      `${place.name}-${place.latitude}-${place.longitude}`;

    map.set(key, place);
  }

  for (const place of incoming) {
    const key =
      place.sourceId ||
      `${place.name}-${place.latitude}-${place.longitude}`;

    map.set(key, place);
  }

  return Array.from(map.values());
}

/* =================================
   SEARCH NEARBY
================================= */

async function searchNearby() {
  loading.value = true;
  errorMessage.value = "";

  offset.value = 0;
  hasMore.value = true;

  try {
    const location =
      await getCurrentLocation();

    const categoryId =
      selectedCategoryId.value;

    const category =
      getGeoapifyCategory(categoryId);

    const results =
      await syncPlaces({
        latitude: location.latitude,
        longitude: location.longitude,
        radius: 5000,
        category,
        categoryId,
        limit: PAGE_SIZE,
        offset: 0,
      });

    places.value = results;

    hasMore.value =
      results.length === PAGE_SIZE;

    hasSearched.value = true;

  } catch (error) {
    console.error(
      "Gagal mencari tempat sekitar:",
      error
    );

    errorMessage.value =
      error instanceof Error
        ? error.message
        : "Gagal mendapatkan lokasi.";
  } finally {
    loading.value = false;
  }
}

/* =================================
   SEARCH BY CITY
================================= */

async function searchByCity() {
  if (!cityQuery.value.trim()) {
    errorMessage.value =
      "Masukkan nama kota terlebih dahulu.";

    return;
  }

  loading.value = true;
  errorMessage.value = "";

  offset.value = 0;
  hasMore.value = true;

  try {
    const categoryId =
      selectedCategoryId.value;

    const category =
      getGeoapifyCategory(categoryId);

    const results =
      await syncPlaces({
        city: cityQuery.value.trim(),
        countryCode:
          selectedCountry.value,
        category,
        categoryId,
        limit: PAGE_SIZE,
        offset: 0,
      });

    places.value = results;

    hasMore.value =
      results.length === PAGE_SIZE;

    hasSearched.value = true;

  } catch (error) {
    console.error(
      "Gagal mencari kota:",
      error
    );

    errorMessage.value =
      error instanceof Error
        ? error.message
        : "Gagal mencari tempat.";
  } finally {
    loading.value = false;
  }
}

/* =================================
   SEARCH BY TEXT
================================= */

async function handleSearch() {
  const query =
    searchQuery.value.trim();

  if (!query) {
    return;
  }

  /*
   * Untuk sementara pencarian teks
   * akan diarahkan menggunakan
   * city/query yang tersedia.
   *
   * Nanti kita bisa bikin search
   * yang lebih proper menggunakan
   * Geoapify Geocoding / Places.
   */

  cityQuery.value = query;

  await searchByCity();
}

/* =================================
   CATEGORY CHANGE
================================= */

async function handleCategoryChange() {
  if (!hasSearched.value) {
    return;
  }

  if (
    locationMode.value === "current"
  ) {
    await searchNearby();
  } else {
    await searchByCity();
  }
}

async function loadMore() {
  if (
    loadingMore.value ||
    !hasMore.value
  ) {
    return;
  }

  loadingMore.value = true;
  errorMessage.value = "";

  try {
    const nextOffset =
      offset.value + PAGE_SIZE;

    const categoryId =
      selectedCategoryId.value;

    const category =
      getGeoapifyCategory(categoryId);

    let results: Place[];

    if (
      locationMode.value === "current"
    ) {
      const location =
        await getCurrentLocation();

      results =
        await syncPlaces({
          latitude: location.latitude,
          longitude: location.longitude,
          radius: 5000,
          category,
          categoryId,
          limit: PAGE_SIZE,
          offset: nextOffset,
        });

    } else {
      results =
        await syncPlaces({
          city: cityQuery.value.trim(),
          countryCode:
            selectedCountry.value,
          category,
          categoryId,
          limit: PAGE_SIZE,
          offset: nextOffset,
        });
    }

    /*
     * Tambahkan hasil baru
     * ke hasil sebelumnya.
     */
    places.value = [
      ...places.value,
      ...results,
    ];

    /*
     * Simpan posisi pagination
     */
    offset.value = nextOffset;

    /*
     * Kalau kurang dari 30,
     * berarti sudah halaman terakhir.
     */
    hasMore.value =
      results.length === PAGE_SIZE;

  } catch (error) {
    console.error(
      "Gagal memuat tempat lainnya:",
      error
    );

    errorMessage.value =
      error instanceof Error
        ? error.message
        : "Gagal memuat tempat lainnya.";
  } finally {
    loadingMore.value = false;
  }
}

/* =================================
   DETAIL
================================= */

function openDetail(place: Place) {
  console.log("PLACE DIKLIK:", place);
  console.log("ID:", place.id);

  if (!place.id) {
    console.error("Place tidak punya ID!");
    return;
  }

  router.push({
    name: "PlaceDetail",
    params: {
      id: place.id,
    },
  });
}

/* =================================
   ROUTE QUERY
================================= */

function loadRouteQuery() {
  const category =
    route.query.category;

  const search =
    route.query.search;

  if (typeof category === "string") {
    const categoryId =
      Number(category);

    if (!Number.isNaN(categoryId)) {
      selectedCategoryId.value =
        categoryId;
    }
  }

  if (typeof search === "string") {
    searchQuery.value = search;
  }
}

/* =================================
   INIT
================================= */

onMounted(async () => {
  await loadCategories();

  loadRouteQuery();
});
</script>

<style scoped>
.location-section {
  margin-top: 16px;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
}

.result-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 24px 4px 12px;
}

.result-header h2 {
  margin: 0;
  font-size: 20px;
}

.result-header span {
  font-size: 14px;
  color: var(--ion-color-medium);
}

.place-content {
  display: flex;
  gap: 14px;
}

.place-icon {
  font-size: 28px;
}

.place-info {
  flex: 1;
}

.place-info h3 {
  margin: 0 0 6px;
  font-size: 17px;
}

.place-info p {
  margin: 4px 0;
}

.address {
  color: var(--ion-color-medium);
  font-size: 13px;
}

.rating {
  font-weight: 600;
}

.error-message {
  padding: 12px;
  border-radius: 8px;
  background: rgba(
    var(--ion-color-danger-rgb),
    0.1
  );
}

.empty-state {
  text-align: center;
  padding: 50px 20px;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 12px;
}

.empty-state h3 {
  margin-bottom: 8px;
}

.empty-state p {
  color: var(--ion-color-medium);
}

.load-more-container {
  margin: 20px 0 30px;
}

</style>