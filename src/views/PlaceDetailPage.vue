<template>
  <ion-page>
    <!-- HEADER -->
    <ion-header class="ion-no-border">
      <ion-toolbar class="custom-toolbar">
        <ion-buttons slot="start">
          <ion-back-button default-href="/places" class="custom-back-btn" />
        </ion-buttons>

        <ion-title class="custom-title">Detail Tempat</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="custom-content">

      <!-- LOADING -->
      <div
        v-if="loading"
        class="state-container fade-in"
      >
        <div class="spinner-wrapper">
          <ion-spinner name="crescent" color="primary" />
        </div>
        <p>Memuat detail tempat...</p>
      </div>

      <!-- ERROR -->
      <div
        v-else-if="errorMessage"
        class="state-container fade-in"
      >
        <div class="empty-illustration">
          ⚠️
        </div>
        <h2>Tempat tidak ditemukan</h2>
        <p class="empty-subtitle">
          {{ errorMessage }}
        </p>
        <ion-button
          class="action-btn"
          shape="round"
          @click="goBack"
        >
          Kembali
        </ion-button>
      </div>

      <!-- DETAIL -->
      <div
        v-else-if="place"
        class="detail-container fade-in"
      >

        <!-- HERO SECTION -->
        <div class="hero-section">
          <img
            v-if="place.image"
            :src="place.image"
            :alt="place.name"
            class="place-image"
          />

          <div
            v-else
            class="image-placeholder"
          >
            <span class="placeholder-emoji">📍</span>
          </div>
          
          <div class="hero-overlay"></div>
        </div>

        <!-- BASIC INFO & CONTENT -->
        <div class="content-wrapper">

          <div class="title-row">
            <div class="title-left">
              <h1 class="place-title">
                {{ place.name }}
              </h1>

              <div class="badges-container">
                <div
                  v-if="categoryName"
                  class="category-badge"
                >
                  <span class="badge-icon">{{ categoryIcon }}</span>
                  {{ categoryName }}
                </div>

                <!-- RATING -->
                <div
                  v-if="place.rating"
                  class="rating-badge"
                >
                  ⭐ {{ place.rating }}
                </div>
              </div>
            </div>

            <!-- FAVORITE (Heart Icon) -->
            <div class="fav-action">
              <button
                class="fav-btn-circle"
                :disabled="favoriteLoading"
                @click="toggleFavorite"
              >
                <span
                  class="favorite-icon"
                  :class="{ active: isFavoritePlace }"
                >
                  {{ isFavoritePlace ? "❤️" : "🤍" }}
                </span>
              </button>
            </div>
          </div>

          <!-- LOCATION CARD -->
          <ion-card class="modern-card">
            <ion-card-header class="no-pad-bottom">
              <ion-card-title class="card-title">
                📍 Lokasi Lengkap
              </ion-card-title>
            </ion-card-header>

            <ion-card-content>
              <div class="address-box">
                <p class="main-address">
                  {{ place.address || "Alamat tidak tersedia" }}
                </p>

                <p
                  v-if="place.city || place.state || place.country"
                  class="location-text"
                >
                  <span class="icon-small">🗺️</span>
                  {{
                    [place.city, place.state, place.country]
                      .filter(Boolean)
                      .join(", ")
                  }}
                </p>
              </div>

              <div class="coordinates">
                <div class="coord-item">
                  <span class="coord-label">Latitude</span>
                  <span class="coord-val">{{ place.latitude }}</span>
                </div>
                <div class="coord-divider"></div>
                <div class="coord-item">
                  <span class="coord-label">Longitude</span>
                  <span class="coord-val">{{ place.longitude }}</span>
                </div>
              </div>
            </ion-card-content>
          </ion-card>

          <!-- DESCRIPTION CARD -->
          <ion-card
            v-if="place.description"
            class="modern-card"
          >
            <ion-card-header class="no-pad-bottom">
              <ion-card-title class="card-title">
                📝 Deskripsi
              </ion-card-title>
            </ion-card-header>

            <ion-card-content>
              <p class="desc-text">
                {{ place.description }}
              </p>
            </ion-card-content>
          </ion-card>

          <!-- SOURCE CARD -->
          <ion-card class="modern-card">
            <ion-card-header class="no-pad-bottom">
              <ion-card-title class="card-title">
                ℹ️ Informasi Data
              </ion-card-title>
            </ion-card-header>

            <ion-card-content>
              <div class="source-info">
                <div class="source-row">
                  <span class="source-label">Sumber:</span>
                  <strong class="source-value">
                    {{ place.source === "geoapify" ? "Geoapify" : "Data Lokal" }}
                  </strong>
                </div>

                <div
                  v-if="place.sourceId"
                  class="source-row mt-1"
                >
                  <span class="source-label">ID sumber:</span>
                  <span class="source-value id-text">{{ place.sourceId }}</span>
                </div>
              </div>
            </ion-card-content>
          </ion-card>

          <!-- ACTION BUTTONS -->
          <div class="action-group">
            
            <!-- VISIT BUTTON -->
            <ion-button
              expand="block"
              shape="round"
              class="primary-btn"
              :disabled="visitLoading || isVisited"
              @click="markAsVisited"
            >
              <ion-spinner v-if="visitLoading" name="crescent" />
              <span v-else-if="isVisited">
                ✓ Sudah Dikunjungi
              </span>
              <span v-else>
                🕒 Tandai Sudah Dikunjungi
              </span>
            </ion-button>

            <!-- TOGGLE FAVORITE BUTTON -->
            <ion-button
              expand="block"
              shape="round"
              fill="outline"
              class="outline-btn"
              :disabled="favoriteLoading"
              @click="toggleFavorite"
            >
              <ion-spinner v-if="favoriteLoading" name="crescent" />
              <span v-else>
                {{ isFavoritePlace ? "❤️ Hapus dari Favorit" : "🤍 Tambah ke Favorit" }}
              </span>
            </ion-button>

            <!-- LOCAL PLACE ACTION (EDIT) -->
            <ion-button
              v-if="place.source === 'local'"
              expand="block"
              shape="round"
              fill="outline"
              color="warning"
              class="outline-btn mt-2"
              @click="editPlace"
            >
              ✏️ Edit Tempat
            </ion-button>

          </div>

        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import {
  onMounted,
  ref,
} from "vue";

import { onIonViewWillEnter } from "@ionic/vue";

import {
  useRoute,
  useRouter,
} from "vue-router";

import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonBackButton,
  IonContent,
  IonSpinner,
  IonButton,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
} from "@ionic/vue";

import type {
  Category,
  Place,
} from "@/db/types";

import {
  getPlace,
  getCategory,
  isFavorite,
  addFavorite,
  removeFavorite,
  addVisitHistory,
  getUserVisitHistory,
} from "@/services/database.service";

import {
  getCurrentUserId,
} from "@/services/auth.service";

/* =================================
   ROUTER
================================= */

const route = useRoute();
const router = useRouter();

/* =================================
   STATE
================================= */

const place =
  ref<Place | null>(null);

const category =
  ref<Category | null>(null);

const loading = ref(true);

const errorMessage =
  ref("");

const isFavoritePlace =
  ref(false);

const favoriteLoading =
  ref(false);

const visitLoading =
  ref(false);

const isVisited = ref(false);

/* =================================
   COMPUTED-LIKE DATA
================================= */

const categoryName =
  ref("");

const categoryIcon =
  ref("📍");

/* =================================
   LOAD PLACE
================================= */

async function loadPlace() {
  loading.value = true;
  errorMessage.value = "";

  try {
    const id = Number(
      route.params.id
    );

    if (
      Number.isNaN(id)
    ) {
      throw new Error(
        "ID tempat tidak valid."
      );
    }

    const result =
      await getPlace(id);

    if (!result) {
      throw new Error(
        "Data tempat tidak ditemukan."
      );
    }

    place.value = result;
    await checkVisited();

    /*
     * Load kategori
     */
    if (result.categoryId) {
      const resultCategory =
        await getCategory(
          result.categoryId
        );

      if (resultCategory) {
        category.value =
          resultCategory;

        categoryName.value =
          resultCategory.name;

        categoryIcon.value =
          resultCategory.icon;
      }
    }

    /*
     * Load favorite status
     */
    await loadFavoriteStatus();

  } catch (error) {
    console.error(
      "Gagal memuat detail tempat:",
      error
    );

    errorMessage.value =
      error instanceof Error
        ? error.message
        : "Gagal memuat tempat.";
  } finally {
    loading.value = false;
  }
  
}

/* =================================
   FAVORITE STATUS
================================= */

async function loadFavoriteStatus() {
  if (!place.value?.id) {
    return;
  }

  const userId =
    getCurrentUserId();

  if (!userId) {
    return;
  }

  isFavoritePlace.value =
    await isFavorite(
      userId,
      place.value.id
    );
}

/* =================================
   TOGGLE FAVORITE
================================= */

async function toggleFavorite() {
  const currentPlace = place.value;

  if (!currentPlace?.id) {
    return;
  }

  const userId = getCurrentUserId();

  if (!userId) {
    router.push({
      name: "Login",
    });

    return;
  }

  favoriteLoading.value = true;

  try {
    if (isFavoritePlace.value) {
      await removeFavorite(
        userId,
        currentPlace.id
      );

      isFavoritePlace.value = false;
    } else {
      await addFavorite({
        userId,
        placeId: currentPlace.id,
        createdAt: new Date().toISOString(),
      });

      isFavoritePlace.value = true;
    }
  } catch (error) {
    console.error(
      "Gagal mengubah favorite:",
      error
    );
  } finally {
    favoriteLoading.value = false;
  }
}

/* =================================
   VISIT HISTORY
================================= */

async function markAsVisited() {
  const currentPlace = place.value;

  if (!currentPlace?.id) {
    return;
  }

  const userId = getCurrentUserId();

  if (!userId) {
    router.push({
      name: "Login",
    });

    return;
  }

  visitLoading.value = true;

  try {
    await addVisitHistory({
      userId,
      placeId: currentPlace.id,
      visitedAt: new Date().toISOString(),
    });

    isVisited.value = true;
  } catch (error) {
    console.error(
      "Gagal mencatat kunjungan:",
      error
    );
  } finally {
    visitLoading.value = false;
  }
}

async function checkVisited() {
  const currentPlace = place.value;

  if (!currentPlace?.id) {
    return;
  }

  const userId = getCurrentUserId();

  if (!userId) {
    return;
  }

  const history =
    await getUserVisitHistory(userId);

  isVisited.value = history.some(
    (item) =>
      item.placeId === currentPlace.id
  );
}


/* =================================
   EDIT LOCAL PLACE
================================= */

function editPlace() {
  if (!place.value?.id) {
    return;
  }

  router.push({
    name: "PlaceEdit",
    query: {
      id: String(place.value.id),
    },
  });
}

/* =================================
   BACK
================================= */

function goBack() {
  router.back();
}

/* =================================
   INIT
================================= */

onIonViewWillEnter(async () => {
  await loadPlace();
});
</script>

<style scoped>
/* ====================
   GLOBAL & HEADER 
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
  font-size: 18px;
  color: #1e293b;
}

.custom-back-btn {
  color: #4f46e5;
}

/* ====================
   HERO SECTION 
   ==================== */
.hero-section {
  position: relative;
  width: 100%;
  height: 280px;
  background: linear-gradient(135deg, #e2e8f0, #cbd5e1);
  border-bottom-left-radius: 40px;
  border-bottom-right-radius: 40px;
  overflow: hidden;
  box-shadow: 0 10px 20px rgba(0,0,0,0.1);
  z-index: 1;
}

.place-image, .image-placeholder {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
}

.placeholder-emoji {
  font-size: 64px;
  opacity: 0.6;
}

.hero-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 80px;
  background: linear-gradient(to top, rgba(248, 250, 252, 1), transparent);
}

/* ====================
   CONTENT WRAPPER 
   ==================== */
.content-wrapper {
  position: relative;
  padding: 0 16px 40px;
  margin-top: -20px;
  z-index: 2;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* ====================
   TITLE & BADGES 
   ==================== */
.title-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
  padding: 0 4px;
}

.title-left {
  flex: 1;
  padding-right: 16px;
}

.place-title {
  font-size: 26px;
  font-weight: 800;
  color: #0f172a;
  margin: 0 0 12px;
  line-height: 1.2;
}

.badges-container {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.category-badge {
  background: #e0e7ff;
  color: #4338ca;
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.rating-badge {
  background: #fef08a;
  color: #854d0e;
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 700;
}

/* FAVORITE BUTTON */
.fav-action {
  display: flex;
  align-items: center;
  justify-content: center;
}

.fav-btn-circle {
  width: 54px;
  height: 54px;
  border-radius: 50%;
  background: white;
  border: none;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.fav-btn-circle:active {
  transform: scale(0.95);
}

.fav-btn-circle:disabled {
  opacity: 0.6;
}

.favorite-icon {
  font-size: 24px;
  transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.favorite-icon.active {
  transform: scale(1.15);
}

/* ====================
   CARDS 
   ==================== */
.modern-card {
  margin: 0;
  border-radius: 20px;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.04);
  background: white;
}

.card-title {
  font-size: 16px;
  font-weight: 700;
  color: #0f172a;
}

.no-pad-bottom {
  padding-bottom: 0;
}

/* LOCATION CARD */
.address-box {
  margin-bottom: 16px;
}

.main-address {
  font-size: 15px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 6px;
  line-height: 1.4;
}

.location-text {
  font-size: 13px;
  color: #64748b;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 6px;
}

.icon-small {
  font-size: 16px;
}

.coordinates {
  display: flex;
  align-items: center;
  background: #f8fafc;
  padding: 12px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
}

.coord-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.coord-label {
  font-size: 11px;
  color: #94a3b8;
  text-transform: uppercase;
  font-weight: 700;
  letter-spacing: 0.5px;
}

.coord-val {
  font-size: 13px;
  color: #475569;
  font-weight: 600;
}

.coord-divider {
  width: 1px;
  height: 24px;
  background: #cbd5e1;
  margin: 0 16px;
}

/* DESCRIPTION CARD */
.desc-text {
  font-size: 14px;
  color: #475569;
  line-height: 1.6;
  margin: 0;
}

/* SOURCE CARD */
.source-info {
  display: flex;
  flex-direction: column;
}

.source-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.source-label {
  font-size: 13px;
  color: #64748b;
}

.source-value {
  font-size: 13px;
  color: #0f172a;
}

.id-text {
  font-family: monospace;
  background: #f1f5f9;
  padding: 2px 8px;
  border-radius: 6px;
  color: #475569;
}

.mt-1 { margin-top: 8px; }

/* ====================
   ACTIONS GROUP 
   ==================== */
.action-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 8px;
}

.primary-btn {
  --box-shadow: 0 8px 16px rgba(var(--ion-color-primary-rgb), 0.25);
  font-weight: 700;
  margin: 0;
}

.outline-btn {
  --border-width: 2px;
  font-weight: 600;
  margin: 0;
}

.mt-2 { margin-top: 16px; }

/* ====================
   STATES (LOADING / ERROR) 
   ==================== */
.state-container {
  min-height: 80vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  padding: 20px;
}

.spinner-wrapper {
  background: white;
  padding: 16px;
  border-radius: 50%;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.05);
  margin-bottom: 16px;
}

.state-container p {
  color: #64748b;
  font-size: 14px;
}

.empty-illustration {
  font-size: 70px;
  margin-bottom: 16px;
}

.state-container h2 {
  font-size: 20px;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 8px;
}

.empty-subtitle {
  color: #64748b;
  font-size: 14px;
  line-height: 1.5;
  margin: 0 0 24px;
}

.action-btn {
  --padding-start: 24px;
  --padding-end: 24px;
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
</style>