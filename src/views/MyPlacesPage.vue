<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Tempat Saya</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">Tempat Saya</ion-title>
        </ion-toolbar>
      </ion-header>

      <div class="page-container">
        <ion-button
          expand="block"
          @click="goToCreate"
        >
          + Tambah Tempat
        </ion-button>

        <!-- Loading -->
        <div v-if="loading" class="state-container">
          <ion-spinner name="crescent" />
          <p>Memuat tempat...</p>
        </div>

        <!-- Error -->
        <ion-text v-else-if="errorMessage" color="danger">
          <p>{{ errorMessage }}</p>
        </ion-text>

        <!-- Empty -->
        <div
          v-else-if="places.length === 0"
          class="state-container"
        >
          <div class="empty-icon">📍</div>

          <h2>Belum Ada Tempat</h2>

          <p>
            Tempat yang kamu buat sendiri akan muncul di sini.
          </p>

          <ion-button @click="goToCreate">
            Buat Tempat Pertama
          </ion-button>
        </div>

        <!-- List -->
        <div v-else class="place-list">
          <ion-card
            v-for="place in places"
            :key="place.id"
            button
            @click="openDetail(place)"
          >
            <img
              v-if="place.image"
              :src="place.image"
              :alt="place.name"
              class="place-image"
            />

            <div
              v-else
              class="place-image placeholder-image"
            >
              📍
            </div>

            <ion-card-header>
              <ion-card-title>
                {{ place.name }}
              </ion-card-title>

              <ion-card-subtitle>
                {{ place.address }}
              </ion-card-subtitle>
            </ion-card-header>

            <ion-card-content>
              <div class="place-meta">
                <span>💾 Tempat Saya</span>

                <span v-if="place.city">
                  📍 {{ place.city }}
                </span>
              </div>

              <p v-if="place.description">
                {{ place.description }}
              </p>
            </ion-card-content>
            <div class="card-actions">
                <ion-button
                    fill="outline"
                    size="small"
                    @click.stop="editPlace(place)"
                >
                    ✏️ Edit
                </ion-button>

                <ion-button
                    fill="outline"
                    color="danger"
                    size="small"
                    @click.stop="confirmDelete(place)"
                >
                    🗑️ Hapus
                </ion-button>
                </div>
          </ion-card>
        </div>
      </div>
    </ion-content>

    <ion-alert
        :is-open="showDeleteAlert"
        header="Hapus Tempat"
        :message="
            selectedPlace
            ? `Apakah kamu yakin ingin menghapus '${selectedPlace.name}'?`
            : ''
        "
        :buttons="[
            {
            text: 'Batal',
            role: 'cancel',
            },
            {
            text: deleting ? 'Menghapus...' : 'Hapus',
            role: 'destructive',
            handler: handleDelete,
            },
        ]"
        @didDismiss="showDeleteAlert = false"
        />

    <BottomNavigation />
  </ion-page>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { onIonViewWillEnter } from "@ionic/vue";
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonSpinner,
  IonText,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
} from "@ionic/vue";

import {
  IonAlert,
} from "@ionic/vue";

import {
  deletePlace,
} from "@/services/database.service";

import { useRouter } from "vue-router";

import BottomNavigation from "@/components/BottomNavigation.vue";

import {
  getAllPlaces,
} from "@/services/database.service";

import type { Place } from "@/db/types";

const router = useRouter();

const places = ref<Place[]>([]);
const loading = ref(true);
const errorMessage = ref("");

const showDeleteAlert = ref(false);
const selectedPlace = ref<Place | null>(null);
const deleting = ref(false);

async function loadMyPlaces() {
  loading.value = true;
  errorMessage.value = "";

  try {
    const allPlaces = await getAllPlaces();

    places.value = allPlaces.filter(
      (place) => place.source === "local"
    );
  } catch (error) {
    console.error("Gagal memuat tempat saya:", error);

    errorMessage.value =
      "Gagal memuat tempat yang kamu buat.";
  } finally {
    loading.value = false;
  }
}

function goToCreate() {
  router.push({
    name: "PlaceForm",
  });
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

function editPlace(place: Place) {
  if (!place.id) {
    return;
  }

  router.push({
    name: "PlaceEdit",
    params: {
      id: String(place.id),
    },
  });
}

function confirmDelete(place: Place) {
  selectedPlace.value = place;
  showDeleteAlert.value = true;
}

async function handleDelete() {
  if (!selectedPlace.value?.id) {
    return;
  }

  deleting.value = true;

  try {
    await deletePlace(selectedPlace.value.id);

    places.value = places.value.filter(
      (item) => item.id !== selectedPlace.value?.id
    );

    showDeleteAlert.value = false;
    selectedPlace.value = null;
  } catch (error) {
    console.error("Gagal menghapus tempat:", error);
    errorMessage.value = "Gagal menghapus tempat.";
  } finally {
    deleting.value = false;
  }
}

onIonViewWillEnter(async () => {
  await loadMyPlaces();
});
</script>

<style scoped>
.page-container {
  padding: 16px;
  padding-bottom: 90px;
}

.state-container {
  min-height: 50vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 32px 16px;
}

.empty-icon {
  font-size: 56px;
  margin-bottom: 12px;
}

.empty-icon + h2 {
  margin-bottom: 8px;
}

.state-container p {
  color: var(--ion-color-medium);
  margin-bottom: 20px;
}

.place-list {
  margin-top: 20px;
}

.place-image {
  width: 100%;
  height: 180px;
  object-fit: cover;
}

.placeholder-image {
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--ion-color-light);
  font-size: 48px;
}

.place-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 10px;
}

.place-meta span {
  font-size: 13px;
  padding: 5px 9px;
  border-radius: 12px;
  background: var(--ion-color-light);
}

ion-card-content p {
  margin-top: 10px;
  color: var(--ion-color-medium);
}

.card-actions {
  display: flex;
  gap: 8px;
  padding: 0 16px 16px;
}

.card-actions ion-button {
  flex: 1;
}

</style>