<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Riwayat</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">

      <!-- LOADING -->
      <div
        v-if="loading"
        class="state-container"
      >
        <ion-spinner name="crescent" />
        <p>Memuat riwayat...</p>
      </div>

      <!-- ERROR -->
      <ion-text
        v-else-if="errorMessage"
        color="danger"
      >
        <p class="error-message">
          {{ errorMessage }}
        </p>
      </ion-text>

      <!-- EMPTY -->
      <div
        v-else-if="history.length === 0"
        class="state-container"
      >
        <div class="empty-icon">
          🕒
        </div>

        <h2>Belum ada riwayat</h2>

        <p>
          Tempat yang kamu kunjungi akan
          muncul di sini.
        </p>

        <ion-button
          fill="outline"
          @click="goToPlaces"
        >
          Jelajahi Tempat
        </ion-button>
      </div>

      <!-- HISTORY LIST -->
      <div v-else>

        <p class="history-count">
          {{ history.length }} riwayat kunjungan
        </p>

        <ion-card
          v-for="item in history"
          :key="item.history.id"
          button
          @click="openDetail(item.place)"
        >

          <!-- IMAGE -->
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

            <p class="visited-at">
              🕒
              {{ formatDate(item.history.visitedAt) }}
            </p>

          </ion-card-content>
        </ion-card>

      </div>

    </ion-content>

    <!-- BOTTOM NAVIGATION -->
    <BottomNavigation />

  </ion-page>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
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

import BottomNavigation from "@/components/BottomNavigation.vue";

import type {
  Place,
  VisitHistory,
} from "@/db/types";

import {
  getUserVisitHistory,
  getPlace,
} from "@/services/database.service";

import {
  getCurrentUserId,
} from "@/services/auth.service";

interface HistoryItem {
  history: VisitHistory;
  place: Place;
}

const router = useRouter();

const history = ref<HistoryItem[]>([]);

const loading = ref(true);

const errorMessage = ref("");

async function loadHistory() {
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

    const historyRecords =
      await getUserVisitHistory(userId);

    const items: HistoryItem[] = [];

    for (const historyRecord of historyRecords) {

      if (!historyRecord.placeId) {
        continue;
      }

      const place = await getPlace(
        historyRecord.placeId
      );

      if (place) {
        items.push({
          history: historyRecord,
          place,
        });
      }
    }

    history.value = items;

  } catch (error) {

    console.error(
      "Gagal memuat riwayat:",
      error
    );

    errorMessage.value =
      error instanceof Error
        ? error.message
        : "Gagal memuat riwayat.";

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

function formatDate(
  date: string
): string {

  return new Intl.DateTimeFormat(
    "id-ID",
    {
      dateStyle: "medium",
      timeStyle: "short",
    }
  ).format(
    new Date(date)
  );
}

function goToPlaces() {

  router.push({
    name: "Places",
  });

}

onIonViewWillEnter(async () => {
  await loadHistory();
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

.history-count {
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

  background:
    var(--ion-color-light);

  font-size: 48px;
}

.address {
  margin-top: 0;
}

.location {
  color:
    var(--ion-color-medium);
}

.visited-at {
  color:
    var(--ion-color-medium);

  margin-bottom: 0;
}

.error-message {
  margin-top: 30px;

  text-align: center;
}

</style>