<template>
  <ion-page>
    <!-- HEADER -->
    <ion-header class="ion-no-border">
      <ion-toolbar class="custom-toolbar">
        <ion-title class="custom-title">Tempat Saya</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true" class="custom-content">
      <ion-header collapse="condense" class="ion-no-border">
        <ion-toolbar class="condense-toolbar">
          <ion-title size="large" class="condense-title">Tempat Saya</ion-title>
        </ion-toolbar>
      </ion-header>

      <div class="page-container">
        
        <!-- ADD BANNER -->
        <div class="add-banner modern-card">
          <div class="banner-text">
            <h3>Kelola Lokasimu</h3>
            <p>Tambah dan atur tempat spesial buatanmu sendiri.</p>
          </div>
          <ion-button
            class="add-btn"
            shape="round"
            @click="goToCreate"
          >
            ＋ Tambah
          </ion-button>
        </div>

        <!-- Loading -->
        <div v-if="loading" class="state-container fade-in">
          <div class="spinner-wrapper">
            <ion-spinner name="crescent" color="primary" />
          </div>
          <p>Memuat tempat...</p>
        </div>

        <!-- Error -->
        <ion-text v-else-if="errorMessage" color="danger" class="fade-in">
          <div class="error-box">
            <span class="error-icon">⚠️</span>
            <div>
              <strong>Terjadi kesalahan</strong>
              <p>{{ errorMessage }}</p>
            </div>
          </div>
        </ion-text>

        <!-- Empty -->
        <div
          v-else-if="places.length === 0"
          class="state-container fade-in"
        >
          <div class="empty-illustration">📍</div>

          <h2>Belum Ada Tempat</h2>

          <p class="empty-subtitle">
            Tempat yang kamu buat sendiri akan muncul di sini. Yuk buat yang pertama!
          </p>

          <ion-button
            class="explore-btn"
            shape="round"
            @click="goToCreate"
          >
            Buat Tempat Pertama
          </ion-button>
        </div>

        <!-- List -->
        <div v-else class="place-list fade-in">
          <div class="list-header">
            <h2 class="section-title">Koleksi Buatanmu</h2>
            <span class="badge-count">{{ places.length }} Tempat</span>
          </div>

          <div class="cards-grid">
            <ion-card
              v-for="place in places"
              :key="place.id"
              button
              class="modern-place-card"
              @click="openDetail(place)"
            >
              <div class="image-wrapper">
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
                  <span class="placeholder-emoji">📍</span>
                </div>
                <div class="image-overlay"></div>
              </div>

              <div class="card-body">
                <ion-card-header class="no-pad">
                  <ion-card-title class="place-name">
                    {{ place.name }}
                  </ion-card-title>

                  <ion-card-subtitle class="place-address">
                    📍 {{ place.address || 'Alamat tidak tersedia' }}
                  </ion-card-subtitle>
                </ion-card-header>

                <ion-card-content class="no-pad mt-2">
                  <div class="place-meta">
                    <span class="meta-badge">💾 Milik Saya</span>
                    <span v-if="place.city" class="meta-city">
                      🏙️ {{ place.city }}
                    </span>
                  </div>

                  <p v-if="place.description" class="place-desc">
                    {{ place.description }}
                  </p>
                </ion-card-content>

                <div class="card-divider"></div>

                <div class="card-actions">
                  <ion-button
                    fill="clear"
                    size="small"
                    class="action-edit-btn"
                    @click.stop="editPlace(place)"
                  >
                    ✏️ Edit
                  </ion-button>

                  <ion-button
                    fill="clear"
                    color="danger"
                    size="small"
                    class="action-delete-btn"
                    @click.stop="confirmDelete(place)"
                  >
                    🗑️ Hapus
                  </ion-button>
                </div>
              </div>
            </ion-card>
          </div>
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
/* ====================
   GLOBAL STYLES 
   ==================== */
.custom-content {
  --background: #f8fafc;
}

.custom-toolbar, .condense-toolbar {
  --background: #ffffff;
}

.custom-title, .condense-title {
  font-weight: 800;
  color: #1e293b;
}

.page-container {
  padding: 16px 16px 40px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* ====================
   ADD BANNER 
   ==================== */
.add-banner {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background: linear-gradient(135deg, #4f46e5, #3b82f6);
  color: white;
  border-radius: 20px;
  box-shadow: 0 10px 20px rgba(79, 70, 229, 0.2);
}

.banner-text h3 {
  margin: 0 0 4px;
  color: var(--ion-color-primary);
  font-size: 18px;
  font-weight: 800;
}

.banner-text p {
  margin: 0;
  color: var(--ion-color-medium-shade);
  font-size: 13px;
  
}

.add-btn {
  --background: #ffffff;
  --color: #4f46e5;
  font-weight: 700;
  font-size: 13px;
  --box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  margin: 0;
}

/* ====================
   HEADER & LIST LAYOUT 
   ==================== */
.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding: 0 4px;
}

.section-title {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: #1e293b;
}

.badge-count {
  background: #e0e7ff;
  color: #4338ca;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 700;
}

.cards-grid {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* ====================
   MODERN CARD DESIGN 
   ==================== */
.modern-card, .modern-place-card {
  margin: 0;
  border-radius: 20px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.04);
  background: white;
  overflow: hidden;
}

.image-wrapper {
  position: relative;
  width: 100%;
  height: 160px;
}

.place-image, .placeholder-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.placeholder-image {
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

.no-pad {
  padding: 0;
}

.place-name {
  margin: 0 0 6px;
  font-size: 18px;
  font-weight: 700;
  color: #0f172a;
}

.place-address {
  margin: 0;
  font-size: 13px;
  color: #64748b;
  line-height: 1.4;
}

.mt-2 {
  margin-top: 10px;
}

.place-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.meta-badge {
  background: #f1f5f9;
  color: #475569;
  padding: 2px 8px;
  border-radius: 8px;
  font-size: 11px;
  font-weight: 700;
}

.meta-city {
  font-size: 12px;
  color: #64748b;
  font-weight: 600;
}

.place-desc {
  margin: 0;
  font-size: 13px;
  color: #64748b;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-divider {
  height: 1px;
  background: #f1f5f9;
  margin: 12px 0 8px;
}

.card-actions {
  display: flex;
  justify-content: flex-end;
  gap: 4px;
}

.action-edit-btn, .action-delete-btn {
  font-weight: 600;
  margin: 0;
  --padding-start: 10px;
  --padding-end: 10px;
}

/* ====================
   STATES (LOADING, ERROR, EMPTY) 
   ==================== */
.state-container {
  min-height: 50vh;
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
  font-size: 64px;
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
  max-width: 260px;
}

.explore-btn {
  font-weight: 600;
  --box-shadow: 0 4px 12px rgba(var(--ion-color-primary-rgb), 0.2);
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