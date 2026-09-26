<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Favorit</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <!-- Loading -->
      <div v-if="loading" class="state-container">
        <ion-spinner name="crescent" />
        <p>Memuat favorit...</p>
      </div>

      <!-- Error -->
      <ion-text
        v-else-if="errorMessage"
        color="danger"
      >
        <p class="error-message">
          {{ errorMessage }}
        </p>
      </ion-text>

      <!-- Empty -->
      <div
        v-else-if="favorites.length === 0"
        class="state-container"
      >
        <div class="empty-icon">❤️</div>

        <h2>Belum ada favorit</h2>

        <p>
          Tempat yang kamu tandai sebagai favorit
          akan muncul di sini.
        </p>

        <ion-button
          fill="outline"
          @click="goToPlaces"
        >
          Jelajahi Tempat
        </ion-button>
      </div>

      <!-- Favorite List -->
      <div v-else>
        <p class="favorite-count">
          {{ favorites.length }} tempat favorit
        </p>

        <ion-card
          v-for="item in favorites"
          :key="item.place.id"
          button
          @click="openDetail(item.place)"
        >
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
            <span>📍</span>
          </div>

          <ion-card-header>
            <ion-card-title>
              {{ item.place.name }}
            </ion-card-title>
          </ion-card-header>

          <ion-card-content>
            <p class="address">
              📍 {{ item.place.address }}
            </p>

            <p
              v-if="item.place.city"
              class="location"
            >
              {{ item.place.city }}
              <span v-if="item.place.state">
                , {{ item.place.state }}
              </span>
            </p>

            <ion-button
              fill="clear"
              color="danger"
              size="small"
              @click.stop="
                removeFromFavorites(item.place.id)
              "
            >
              ❤️ Hapus Favorit
            </ion-button>
          </ion-card-content>
        </ion-card>
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
.state-container {
  min-height: 60vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
}

.state-container p {
  color: var(--ion-color-medium);
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 12px;
}

.favorite-count {
  color: var(--ion-color-medium);
  margin-bottom: 16px;
}

.place-image,
.image-placeholder {
  width: 100%;
  height: 180px;
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
  background: var(--ion-color-light);
  font-size: 48px;
}

.address {
  margin-top: 0;
}

.location {
  color: var(--ion-color-medium);
}

.error-message {
  margin-top: 30px;
  text-align: center;
}
</style>