<template>
  <ion-page>
    <!-- HEADER -->
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/places" />
        </ion-buttons>

        <ion-title>Detail Tempat</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content>

      <!-- LOADING -->
      <div
        v-if="loading"
        class="state-container"
      >
        <ion-spinner />
        <p>Memuat detail tempat...</p>
      </div>

      <!-- ERROR -->
      <div
        v-else-if="errorMessage"
        class="state-container"
      >
        <div class="state-icon">
          ⚠️
        </div>

        <h2>
          Tempat tidak ditemukan
        </h2>

        <p>
          {{ errorMessage }}
        </p>

        <ion-button
          @click="goBack"
        >
          Kembali
        </ion-button>
      </div>

      <!-- DETAIL -->
      <div
        v-else-if="place"
        class="detail-container"
      >

        <!-- HERO -->
        <div class="hero">

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
            📍
          </div>

        </div>

        <!-- BASIC INFO -->
        <div class="content">

          <div class="title-row">

            <div>
              <h1>
                {{ place.name }}
              </h1>

              <p
                v-if="categoryName"
                class="category"
              >
                {{ categoryIcon }}
                {{ categoryName }}
              </p>
            </div>

            <!-- FAVORITE -->
            <ion-button
              fill="clear"
              size="large"
              :disabled="favoriteLoading"
              @click="toggleFavorite"
            >
              <span
                class="favorite-icon"
                :class="{
                  active: isFavoritePlace
                }"
              >
                {{
                  isFavoritePlace
                    ? "❤️"
                    : "🤍"
                }}
              </span>
            </ion-button>

          </div>

          <!-- RATING -->
          <div
            v-if="place.rating"
            class="rating"
          >
            ⭐ {{ place.rating }}
          </div>

          <!-- LOCATION -->
          <ion-card>
            <ion-card-header>
              <ion-card-title>
                📍 Lokasi
              </ion-card-title>
            </ion-card-header>

            <ion-card-content>

              <p>
                {{ place.address || "Alamat tidak tersedia" }}
              </p>

              <p
                v-if="
                  place.city ||
                  place.state ||
                  place.country
                "
                class="location-text"
              >
                {{
                  [
                    place.city,
                    place.state,
                    place.country
                  ]
                    .filter(Boolean)
                    .join(", ")
                }}
              </p>

              <div class="coordinates">

                <span>
                  Latitude:
                  {{ place.latitude }}
                </span>

                <span>
                  Longitude:
                  {{ place.longitude }}
                </span>

              </div>

            </ion-card-content>
          </ion-card>

          <!-- DESCRIPTION -->
          <ion-card
            v-if="place.description"
          >
            <ion-card-header>
              <ion-card-title>
                📝 Deskripsi
              </ion-card-title>
            </ion-card-header>

            <ion-card-content>
              <p>
                {{ place.description }}
              </p>
            </ion-card-content>
          </ion-card>

          <!-- SOURCE -->
          <ion-card>
            <ion-card-header>
              <ion-card-title>
                ℹ️ Informasi Data
              </ion-card-title>
            </ion-card-header>

            <ion-card-content>

              <p>
                Sumber:
                <strong>
                  {{
                    place.source === "geoapify"
                      ? "Geoapify"
                      : "Data Lokal"
                  }}
                </strong>
              </p>

              <p
                v-if="place.sourceId"
              >
                ID sumber:
                {{ place.sourceId }}
              </p>

            </ion-card-content>
          </ion-card>

          <!-- VISIT BUTTON -->
          <ion-button
            expand="block"
            :disabled="visitLoading || isVisited"
            @click="markAsVisited"
          >
            <ion-spinner
              v-if="visitLoading"
              name="crescent"
            />

            <span v-else-if="isVisited">
              ✓ Sudah Dikunjungi
            </span>

            <span v-else>
              🕒 Tandai Sudah Dikunjungi
            </span>
          </ion-button>

          <ion-button
            expand="block"
            fill="outline"
            :disabled="favoriteLoading"
            @click="toggleFavorite"
          >
            <ion-spinner
              v-if="favoriteLoading"
              name="crescent"
            />

            <span v-else>
              {{ isFavoritePlace ? "Hapus dari Favorit" : "Tambah ke Favorit" }}
            </span>
          </ion-button>

          <!-- LOCAL PLACE ACTION -->
          <ion-button
            v-if="place.source === 'local'"
            expand="block"
            fill="outline"
            @click="editPlace"
          >
            ✏️ Edit Tempat
          </ion-button>

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
.state-container {
  min-height: 70vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 30px;
}

.state-icon {
  font-size: 50px;
  margin-bottom: 12px;
}

.hero {
  width: 100%;
}

.place-image {
  width: 100%;
  height: 240px;
  object-fit: cover;
}

.image-placeholder {
  height: 240px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--ion-color-light);
  font-size: 70px;
}

.content {
  padding: 16px;
}

.title-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
}

.title-row h1 {
  margin: 0;
  font-size: 26px;
  line-height: 1.2;
}

.category {
  margin-top: 8px;
  color: var(--ion-color-primary);
  font-weight: 600;
}

.favorite-icon {
  font-size: 30px;
}

.favorite-icon.active {
  transform: scale(1.05);
}

.rating {
  margin: 10px 0 18px;
  font-size: 17px;
  font-weight: 600;
}

.location-text {
  color: var(--ion-color-medium);
}

.coordinates {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-top: 14px;
  font-size: 13px;
  color: var(--ion-color-medium);
}

ion-card {
  margin-left: 0;
  margin-right: 0;
}

ion-button {
  margin-top: 12px;
}
</style>