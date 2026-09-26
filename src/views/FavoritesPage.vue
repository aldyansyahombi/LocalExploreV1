<template>
  <ion-page>
    <!-- HEADER -->
    <ion-header class="ion-no-border">
      <ion-toolbar class="custom-toolbar">
        <ion-title class="custom-title">Favorit Tersimpan</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="custom-content ion-padding">
      
      <!-- LOADING -->
      <div v-if="loading" class="state-container fade-in">
        <div class="spinner-wrapper">
          <ion-spinner name="crescent" color="danger" />
        </div>
        <p>Memuat tempat favoritmu...</p>
      </div>

      <!-- ERROR -->
      <ion-text
        v-else-if="errorMessage"
        color="danger"
        class="fade-in"
      >
        <div class="error-box">
          <span class="error-icon">⚠️</span>
          <div>
            <strong>Terjadi kesalahan</strong>
            <p>{{ errorMessage }}</p>
          </div>
        </div>
      </ion-text>

      <!-- EMPTY STATE -->
      <div
        v-else-if="favorites.length === 0"
        class="state-container fade-in"
      >
        <div class="empty-illustration">
          💖
        </div>

        <h2>Belum ada favorit</h2>

        <p class="empty-subtitle">
          Tempat yang kamu tandai sebagai favorit akan muncul di sini. Yuk mulai kumpulkan tempat impianmu!
        </p>

        <ion-button
          class="explore-btn"
          shape="round"
          @click="goToPlaces"
        >
          Jelajahi Tempat
        </ion-button>
      </div>

      <!-- FAVORITE LIST -->
      <div v-else class="fade-in">
        <div class="list-header">
          <h2 class="section-title">Koleksi Kamu</h2>
          <span class="badge-count">{{ favorites.length }} Tempat</span>
        </div>

        <div class="favorites-list">
          <ion-card
            v-for="item in favorites"
            :key="item.place.id"
            button
            class="modern-fav-card"
            @click="openDetail(item.place)"
          >
            <!-- IMAGE WRAPPER -->
            <div class="image-wrapper">
              <div
                v-if="item.place.image"
                class="place-image"
              >
                <img
                  :src="item.place.image"
                  :alt="item.place.name"
                />
              </div>

              <div
                v-else
                class="image-placeholder"
              >
                <span class="placeholder-emoji">🏞️</span>
              </div>
              
              <!-- Gradient Overlay (Optional for aesthetics) -->
              <div class="image-overlay"></div>
            </div>

            <!-- CARD CONTENT -->
            <div class="card-body">
              <h3 class="place-name">{{ item.place.name }}</h3>

              <div class="info-group">
                <p class="address">
                  <span class="icon-small">📍</span> {{ item.place.address }}
                </p>

                <p
                  v-if="item.place.city"
                  class="location"
                >
                  <span class="icon-small">🗺️</span>
                  {{ item.place.city }}
                  <span v-if="item.place.state">
                    , {{ item.place.state }}
                  </span>
                </p>
              </div>

              <div class="card-divider"></div>

              <div class="card-footer">
                <ion-button
                  class="remove-btn"
                  fill="clear"
                  color="danger"
                  size="small"
                  @click.stop="removeFromFavorites(item.place.id)"
                >
                  <span class="remove-icon">❤️</span> Hapus Favorit
                </ion-button>
              </div>
            </div>
          </ion-card>
        </div>
      </div>
      
    </ion-content>
    
    <BottomNavigation />
  </ion-page>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import BottomNavigation from "@/components/BottomNavigation.vue";
import { onIonViewWillEnter } from "@ionic/vue";

import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonButton,
  IonSpinner,
  IonText,
} from "@ionic/vue";

import type {
  Favorite,
  Place,
} from "@/db/types";

import {
  getUserFavorites,
  getPlace,
  removeFavorite,
} from "@/services/database.service";

import {
  getCurrentUserId,
} from "@/services/auth.service";

interface FavoriteItem {
  favorite: Favorite;
  place: Place;
}

const router = useRouter();

const favorites = ref<FavoriteItem[]>([]);
const loading = ref(true);
const errorMessage = ref("");

async function loadFavorites() {
  loading.value = true;
  errorMessage.value = "";

  try {
    const userId = getCurrentUserId();

    if (!userId) {
      router.push({
        name: "Login",
      });
      return;
    }

    const favoriteRecords =
      await getUserFavorites(userId);

    const items: FavoriteItem[] = [];

    for (const favorite of favoriteRecords) {
      if (!favorite.placeId) {
        continue;
      }

      const place = await getPlace(
        favorite.placeId
      );

      if (place) {
        items.push({
          favorite,
          place,
        });
      }
    }

    favorites.value = items;
  } catch (error) {
    console.error(
      "Gagal memuat favorit:",
      error
    );

    errorMessage.value =
      error instanceof Error
        ? error.message
        : "Gagal memuat daftar favorit.";
  } finally {
    loading.value = false;
  }
}

function openDetail(place: Place) {
  if (!place.id) {
    return;
  }

  router.push({
    name: "PlaceDetail",
    params: {
      id: place.id,
    },
  });
}

async function removeFromFavorites(
  placeId?: number
) {
  if (!placeId) {
    return;
  }

  const userId = getCurrentUserId();

  if (!userId) {
    router.push({
      name: "Login",
    });
    return;
  }

  try {
    await removeFavorite(
      userId,
      placeId
    );

    favorites.value =
      favorites.value.filter(
        (item) =>
          item.place.id !== placeId
      );
  } catch (error) {
    console.error(
      "Gagal menghapus favorit:",
      error
    );
  }
}

function goToPlaces() {
  router.push({
    name: "Places",
  });
}

onIonViewWillEnter(async () => {
  await loadFavorites();
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

/* ====================
   HEADER & LAYOUT 
   ==================== */
.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 8px 4px 16px;
}

.section-title {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: #1e293b;
}

.badge-count {
  background: #ffe4e6;
  color: #e11d48;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 700;
}

.favorites-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding-bottom: 24px;
}

/* ====================
   CARD DESIGN 
   ==================== */
.modern-fav-card {
  margin: 0;
  border-radius: 20px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.05);
  background: white;
  overflow: hidden;
}

.image-wrapper {
  position: relative;
  width: 100%;
  height: 180px;
}

.place-image,
.image-placeholder {
  width: 100%;
  height: 100%;
}

.place-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-placeholder {
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #f1f5f9, #e2e8f0);
}

.placeholder-emoji {
  font-size: 48px;
  opacity: 0.5;
}

.image-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 40%;
  background: linear-gradient(to top, rgba(0,0,0,0.1), transparent);
}

.card-body {
  padding: 16px;
}

.place-name {
  margin: 0 0 10px;
  font-size: 18px;
  font-weight: 700;
  color: #0f172a;
  line-height: 1.3;
}

.info-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.address, .location {
  margin: 0;
  font-size: 13px;
  color: #64748b;
  display: flex;
  align-items: flex-start;
  gap: 6px;
  line-height: 1.4;
}

.icon-small {
  font-size: 14px;
  margin-top: 2px;
}

.card-divider {
  height: 1px;
  background: #f1f5f9;
  margin: 16px 0;
}

.card-footer {
  display: flex;
  justify-content: flex-end;
}

.remove-btn {
  --padding-start: 12px;
  --padding-end: 12px;
  font-weight: 600;
  margin: 0;
}

.remove-icon {
  margin-right: 6px;
}

/* ====================
   STATES (ERROR, LOAD, EMPTY) 
   ==================== */
.state-container {
  min-height: 60vh;
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
  display: flex;
  align-items: center;
  justify-content: center;
}

.state-container p {
  color: #64748b;
  font-size: 14px;
}

.empty-illustration {
  font-size: 70px;
  margin-bottom: 16px;
  animation: float 3s ease-in-out infinite;
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
  max-width: 280px;
}

.explore-btn {
  --padding-start: 24px;
  --padding-end: 24px;
  --box-shadow: 0 4px 12px rgba(var(--ion-color-primary-rgb), 0.2);
  font-weight: 600;
}

.error-box {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  background: #fef2f2;
  border: 1px solid #fecaca;
  padding: 16px;
  border-radius: 16px;
  color: #b91c1c;
  margin-top: 20px;
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