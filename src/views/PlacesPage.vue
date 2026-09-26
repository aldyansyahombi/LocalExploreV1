<template>
  <ion-page>
    <!-- HEADER -->
    <ion-header class="ion-no-border">
      <ion-toolbar class="custom-toolbar">
        <ion-title class="custom-title">Jelajahi</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="custom-content">
      <div class="places-container">

        <!-- INTRO & HERO BANNER -->
        <section class="hero-section">
          <div class="hero-card">
            <img 
              src="@/assets/gambar2.jpeg" 
              alt="Eksplorasi" 
              class="hero-image"
            />
            <div class="hero-overlay">
              <span class="intro-badge">✨ Eksplorasi</span>
              <h1>Temukan tempat menarik</h1>
              <p class="intro-description">
                Cari wisata, kuliner, taman, dan tempat publik di sekitar kamu.
              </p>
            </div>
          </div>
        </section>

        <!-- SEARCH -->
        <section class="search-section">
          <ion-searchbar
            class="modern-searchbar"
            v-model="searchQuery"
            placeholder="Cari tempat, taman, kuliner..."
            :disabled="loading"
            :debounce="300"
            @keyup.enter="handleSearch"
          />
          <p class="search-hint">
            <span class="hint-icon">💡</span> Cari berdasarkan nama atau kata kunci
          </p>
        </section>

        <!-- QUICK ACTIONS -->
        <section class="quick-actions">
          <ion-button
            class="action-btn"
            expand="block"
            shape="round"
            @click="goToCreate"
          >
            ＋ Tambah Tempat
          </ion-button>

          <ion-button
            class="action-btn"
            expand="block"
            shape="round"
            fill="outline"
            @click="goToMyPlaces"
          >
            💾 Tempat Saya
          </ion-button>
        </section>

        <!-- LOCATION -->
        <section class="section-block">
          <div class="section-heading">
            <h2>📍 Area Jelajah</h2>
            <p>Pilih dari mana kamu ingin mulai mencari.</p>
          </div>

          <ion-card class="modern-card location-card">
            <ion-card-content class="no-padding-bottom">
              <ion-segment v-model="locationMode" class="custom-segment" mode="ios">
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
                class="location-section fade-in"
              >
                <div class="location-info">
                  <div class="icon-box blue-bg">📍</div>
                  <div class="location-text">
                    <strong>Di sekitar kamu</strong>
                    <p>Temukan destinasi tersembunyi di dekat lokasimu saat ini.</p>
                  </div>
                </div>

                <ion-button
                  class="search-btn"
                  expand="block"
                  shape="round"
                  :disabled="loading"
                  @click="searchNearby"
                >
                  <ion-spinner v-if="loading" name="crescent" />
                  <span v-else>Cari di Sekitar Saya</span>
                </ion-button>
              </div>

              <!-- MANUAL LOCATION -->
              <div
                v-else
                class="location-section fade-in"
              >
                <div class="form-wrapper">
                  <ion-item lines="none" class="modern-input">
                    <ion-label position="stacked">Negara</ion-label>
                    <ion-select
                      v-model="selectedCountry"
                      interface="popover"
                    >
                      <ion-select-option value="id">🇮🇩 Indonesia</ion-select-option>
                      <ion-select-option value="my">🇲🇾 Malaysia</ion-select-option>
                      <ion-select-option value="sg">🇸🇬 Singapore</ion-select-option>
                      <ion-select-option value="jp">🇯🇵 Jepang</ion-select-option>
                      <ion-select-option value="us">🇺🇸 Amerika Serikat</ion-select-option>
                      <ion-select-option value="au">🇦🇺 Australia</ion-select-option>
                    </ion-select>
                  </ion-item>

                  <ion-item lines="none" class="modern-input">
                    <ion-label position="stacked">Kota</ion-label>
                    <ion-input
                      v-model="cityQuery"
                      placeholder="Contoh: Kendari"
                      @keyup.enter="searchByCity"
                    />
                  </ion-item>
                </div>

                <ion-button
                  class="search-btn"
                  expand="block"
                  shape="round"
                  :disabled="loading || !cityQuery.trim()"
                  @click="searchByCity"
                >
                  <ion-spinner v-if="loading" name="crescent" />
                  <span v-else>🔎 Cari Kota</span>
                </ion-button>
              </div>
            </ion-card-content>
          </ion-card>
        </section>

        <!-- CATEGORY -->
        <section class="section-block">
          <div class="section-heading">
            <h2>🏷️ Kategori</h2>
            <p>Persempit hasil pencarianmu.</p>
          </div>

          <ion-card class="modern-card category-card">
            <ion-card-content>
              <ion-select
                class="category-select"
                v-model="selectedCategoryId"
                interface="popover"
                placeholder="Pilih Semua Kategori"
                @ionChange="handleCategoryChange"
              >
                <ion-select-option :value="undefined">
                  Semua kategori
                </ion-select-option>

                <ion-select-option
                  v-for="category in categories"
                  :key="category.id"
                  :value="category.id"
                >
                  {{ category.icon }} {{ category.name }}
                </ion-select-option>
              </ion-select>
            </ion-card-content>
          </ion-card>
        </section>

        <!-- ERROR -->
        <ion-text
          v-if="errorMessage"
          color="danger"
        >
          <div class="error-box">
            <span class="error-icon">⚠️</span>
            <div>
              <strong>Terjadi kesalahan</strong>
              <p>{{ errorMessage }}</p>
            </div>
          </div>
        </ion-text>

        <!-- LOADING -->
        <div
          v-if="loading"
          class="loading-container"
        >
          <div class="spinner-wrapper">
            <ion-spinner name="crescent" color="primary" />
          </div>
          <p>Mencari tempat terbaik untukmu...</p>
        </div>

        <!-- RESULT HEADER -->
        <section
          v-if="!loading && places.length > 0"
          class="results-section fade-in"
        >
          <div class="result-header">
            <h2>Rekomendasi Tempat</h2>
            <span class="badge-count">{{ places.length }} Ditemukan</span>
          </div>

          <!-- RESULTS -->
          <div class="places-list">
            <ion-card
              v-for="place in places"
              :key="place.sourceId || place.id || `${place.latitude}-${place.longitude}`"
              button
              class="modern-place-card"
              @click="openDetail(place)"
            >
              <ion-card-content>
                <div class="place-content">
                  <div class="place-thumbnail">
                    <span class="thumbnail-emoji">📍</span>
                  </div>

                  <div class="place-info">
                    <h3>{{ place.name }}</h3>
                    <p class="place-location">
                      <span class="icon-small">🗺️</span>
                      {{ place.city || "Lokasi tidak diketahui" }}
                      <span v-if="place.country">, {{ place.country }}</span>
                    </p>
                    
                    <p v-if="place.address" class="address">
                      {{ place.address }}
                    </p>

                    <div class="place-footer">
                      <span v-if="place.rating" class="rating-badge">
                        ⭐ {{ place.rating }}
                      </span>
                      <span class="arrow-icon">➔</span>
                    </div>
                  </div>
                </div>
              </ion-card-content>
            </ion-card>
          </div>
        </section>

        <!-- LOAD MORE -->
        <div
          v-if="!loading && places.length > 0 && hasMore"
          class="load-more-container"
        >
          <ion-button
            fill="outline"
            expand="block"
            shape="round"
            class="load-more-btn"
            :disabled="loadingMore"
            @click="loadMore"
          >
            <ion-spinner v-if="loadingMore" name="crescent" />
            <span v-else>Lihat Lebih Banyak</span>
          </ion-button>
        </div>

        <!-- EMPTY STATE -->
        <div
          v-if="!loading && hasSearched && places.length === 0 && !errorMessage"
          class="empty-state fade-in"
        >
          <div class="empty-illustration">
            🏝️
          </div>
          <h3>Wah, tempatnya tidak ketemu!</h3>
          <p>
            Coba gunakan kata kunci lain, ganti kota, atau ubah kategori pilihanmu.
          </p>
        </div>

      </div>
    </ion-content>

    <BottomNavigation />
  </ion-page>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";

import BottomNavigation from "@/components/BottomNavigation.vue";


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

const searchMode = ref<
  "nearby" | "city" | "name"
>("nearby");

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

function goToMyPlaces() {
  router.push({
    name: "MyPlaces",
  });
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
  searchMode.value = "nearby";

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
  searchMode.value = "city";

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
  await searchByName();
}

async function searchByName() {
  const query =
    searchQuery.value.trim();

  if (!query) return;

  loading.value = true;
  errorMessage.value = "";
  offset.value = 0;
  hasMore.value = true;
  hasSearched.value = true;
  searchMode.value = "name";

  try {
    const categoryId =
      selectedCategoryId.value;

    const category =
      selectedCategoryId.value
        ? getGeoapifyCategory(
            selectedCategoryId.value
          )
        : "tourism.sights";

    let results: Place[];

    if (
      locationMode.value === "current"
    ) {
      const location =
        await getCurrentLocation();

      results =
        await syncPlaces({
          name: query,

          latitude:
            location.latitude,

          longitude:
            location.longitude,

          radius: 5000,

          category,
          categoryId,

          limit: PAGE_SIZE,
          offset: 0,
        });

    } else {
      results =
        await syncPlaces({
          name: query,

          city:
            cityQuery.value.trim() ||
            undefined,

          countryCode:
            selectedCountry.value,

          category,
          categoryId,

          limit: PAGE_SIZE,
          offset: 0,
        });
    }

    places.value = results;

    hasMore.value =
      results.length === PAGE_SIZE;

  } catch (error) {
    console.error(
      "Gagal mencari tempat:",
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

    /*
     * MODE 1:
     * Pencarian berdasarkan nama / keyword
     * contoh: "menara", "taman", "sate"
     */
    if (searchMode.value === "name") {
      const query =
        searchQuery.value.trim();

      if (
        locationMode.value === "current"
      ) {
        const location =
          await getCurrentLocation();

        results =
          await syncPlaces({
            name: query,
            latitude: location.latitude,
            longitude: location.longitude,
            radius: 5000,
            category,
            categoryId,
            countryCode:
              selectedCountry.value,
            limit: PAGE_SIZE,
            offset: nextOffset,
          });

      } else {
        results =
          await syncPlaces({
            name: query,
            city:
              cityQuery.value.trim() ||
              undefined,
            countryCode:
              selectedCountry.value,
            category,
            categoryId,
            limit: PAGE_SIZE,
            offset: nextOffset,
          });
      }

    /*
     * MODE 2:
     * Pencarian berdasarkan lokasi GPS
     */
    } else if (
      searchMode.value === "nearby"
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
          countryCode:
            selectedCountry.value,
          limit: PAGE_SIZE,
          offset: nextOffset,
        });

    /*
     * MODE 3:
     * Pencarian berdasarkan kota
     */
    } else {
      results =
        await syncPlaces({
          city:
            cityQuery.value.trim(),
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
     * Simpan posisi pagination.
     */
    offset.value = nextOffset;

    /*
     * Kalau kurang dari PAGE_SIZE,
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


function goToCreate() {
  router.push({
    name: "PlaceForm",
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
/* ====================
   GLOBAL STYLES 
   ==================== */
.custom-content {
  --background: #f8fafc;
}

.custom-toolbar {
  --background: #ffffff;
  --box-shadow: 0 2px 10px rgba(0, 0, 0, 0.03);
}

.custom-title {
  font-weight: 700;
  font-size: 20px;
  color: #1e293b;
}

.places-container {
  padding: 16px 16px 40px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* ====================
   HERO SECTION 
   ==================== */
.hero-card {
  position: relative;
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
  height: 200px;
}

.hero-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: brightness(0.6);
}

.hero-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  padding: 24px;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  background: linear-gradient(to top, rgba(0,0,0,0.8), transparent);
}

.intro-badge {
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(8px);
  color: white;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  align-self: flex-start;
  margin-bottom: 8px;
}

.hero-overlay h1 {
  color: white;
  margin: 0 0 4px;
  font-size: 22px;
  font-weight: 700;
  line-height: 1.2;
}

.intro-description {
  color: #e2e8f0;
  margin: 0;
  font-size: 13px;
  line-height: 1.4;
}

/* ====================
   SEARCH SECTION 
   ==================== */
.modern-searchbar {
  --border-radius: 16px;
  --box-shadow: 0 4px 12px rgba(0,0,0,0.05);
  --background: white;
  padding: 0;
}

.search-hint {
  font-size: 12px;
  color: #64748b;
  margin: 8px 0 0 8px;
  display: flex;
  align-items: center;
  gap: 6px;
}

/* ====================
   QUICK ACTIONS 
   ==================== */
.quick-actions {
  display: flex;
  gap: 12px;
}

.action-btn {
  flex: 1;
  margin: 0;
  --border-radius: 14px;
  --box-shadow: 0 4px 12px rgba(var(--ion-color-primary-rgb), 0.2);
  font-weight: 600;
  font-size: 14px;
}

/* ====================
   SECTION BLOCKS 
   ==================== */
.section-heading {
  margin-bottom: 12px;
  padding: 0 4px;
}

.section-heading h2 {
  font-size: 18px;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 4px;
}

.section-heading p {
  font-size: 13px;
  color: #64748b;
  margin: 0;
}

.modern-card {
  margin: 0;
  border-radius: 20px;
  background: white;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.04);
}

/* ====================
   LOCATION TAB & FORMS 
   ==================== */
.custom-segment {
  background: #f1f5f9;
  border-radius: 12px;
  padding: 4px;
  margin-bottom: 16px;
}

.location-info {
  display: flex;
  gap: 16px;
  align-items: center;
  padding: 12px;
  background: #f8fafc;
  border-radius: 16px;
  margin-bottom: 16px;
}

.icon-box {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
}

.blue-bg { background: #e0f2fe; }

.location-text strong {
  font-size: 15px;
  color: #0f172a;
  display: block;
  margin-bottom: 4px;
}

.location-text p {
  margin: 0;
  font-size: 12px;
  color: #64748b;
  line-height: 1.4;
}

.modern-input {
  --background: #f8fafc;
  --border-radius: 12px;
  margin-bottom: 12px;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
}

.search-btn {
  margin-top: 16px;
  --border-radius: 14px;
  font-weight: 600;
}

/* ====================
   RESULTS SECTION 
   ==================== */
.result-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  padding: 0 4px;
}

.result-header h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: #1e293b;
}

.badge-count {
  background: #e2e8f0;
  color: #475569;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.places-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.modern-place-card {
  margin: 0;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
  background: white;
}

.place-content {
  display: flex;
  gap: 16px;
  align-items: center;
}

.place-thumbnail {
  width: 70px;
  height: 70px;
  background: linear-gradient(135deg, #e0e7ff, #c7d2fe);
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.thumbnail-emoji {
  font-size: 32px;
}

.place-info {
  flex: 1;
}

.place-info h3 {
  margin: 0 0 4px;
  font-size: 16px;
  font-weight: 700;
  color: #0f172a;
}

.place-location {
  margin: 0 0 6px;
  font-size: 13px;
  color: #64748b;
  display: flex;
  align-items: center;
  gap: 4px;
}

.icon-small {
  font-size: 14px;
}

.address {
  margin: 0 0 8px;
  color: #94a3b8;
  font-size: 12px;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.place-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.rating-badge {
  background: #fef08a;
  color: #854d0e;
  padding: 2px 8px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 700;
}

.arrow-icon {
  color: #cbd5e1;
  font-size: 16px;
}

/* ====================
   STATES (ERROR, LOAD, EMPTY) 
   ==================== */
.error-box {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  background: #fef2f2;
  border: 1px solid #fecaca;
  padding: 16px;
  border-radius: 16px;
  color: #b91c1c;
}

.error-icon {
  font-size: 24px;
}

.error-box strong {
  display: block;
  margin-bottom: 4px;
}

.error-box p {
  margin: 0;
  font-size: 13px;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
}

.spinner-wrapper {
  background: white;
  padding: 16px;
  border-radius: 50%;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.05);
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.loading-container p {
  color: #64748b;
  font-size: 14px;
  font-weight: 500;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
}

.empty-illustration {
  font-size: 70px;
  margin-bottom: 16px;
  animation: float 3s ease-in-out infinite;
}

.empty-state h3 {
  font-size: 18px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 8px;
}

.empty-state p {
  font-size: 14px;
  color: #64748b;
  line-height: 1.5;
  margin: 0 auto;
  max-width: 250px;
}

.load-more-btn {
  --border-width: 2px;
  --border-radius: 16px;
  font-weight: 600;
}

/* ====================
   ANIMATIONS
   ==================== */
.fade-in {
  animation: fadeIn 0.4s ease-in-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes float {
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
}
</style>