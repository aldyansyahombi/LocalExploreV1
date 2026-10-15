<template>
  <ion-page>
    <ion-header class="ion-no-border">
      <ion-toolbar class="custom-toolbar">
        <ion-buttons slot="start">
          <ion-back-button default-href="/profile" />
        </ion-buttons>
        <ion-title class="custom-title">Data Offline</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="custom-content ion-padding">
      <div class="header-text">
        <h2>Unduh Data Lokasi</h2>
        <p>
          Fitur ini memungkinkan kamu untuk mencari tempat dan melihat peta
          OpenStreetMap bahkan saat tidak ada koneksi internet.
        </p>
      </div>

      <ion-card class="modern-card mt-4">
        <ion-card-header>
          <ion-card-title class="card-title">Pilih Area</ion-card-title>
        </ion-card-header>
        <ion-card-content>
          <ion-item lines="none" class="modern-input">
            <ion-label position="stacked">Negara</ion-label>
            <ion-select v-model="selectedCountry" interface="popover">
              <ion-select-option value="id">🇮🇩 Indonesia</ion-select-option>
              <ion-select-option value="my">🇲🇾 Malaysia</ion-select-option>
              <ion-select-option value="sg">🇸🇬 Singapore</ion-select-option>
              <ion-select-option value="jp">🇯🇵 Jepang</ion-select-option>
              <ion-select-option value="us">🇺🇸 Amerika Serikat</ion-select-option>
              <ion-select-option value="au">🇦🇺 Australia</ion-select-option>
            </ion-select>
          </ion-item>

          <ion-item lines="none" class="modern-input mt-2">
            <ion-label position="stacked">Kota</ion-label>
            <ion-input v-model="cityQuery" placeholder="Contoh: Kendari" />
          </ion-item>

          <ion-button
            class="mt-4"
            expand="block"
            shape="round"
            :disabled="loading || !cityQuery.trim()"
            @click="downloadArea"
          >
            <ion-spinner v-if="loading" name="crescent" />
            <span v-else>⬇️ Unduh Data (Seperti API)</span>
          </ion-button>
        </ion-card-content>
      </ion-card>

      <div v-if="progress > 0 && progress < 100" class="progress-container">
        <p>Mengunduh: {{ progress }}%</p>
        <ion-progress-bar :value="progress / 100"></ion-progress-bar>
      </div>

      <div v-if="successMessage" class="success-message">
        ✅ {{ successMessage }}
      </div>
      
      <div v-if="errorMessage" class="error-message">
        ⚠️ {{ errorMessage }}
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref } from "vue";
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
  IonItem,
  IonLabel,
  IonSelect,
  IonSelectOption,
  IonInput,
  IonButton,
  IonSpinner,
  IonProgressBar,
  IonButtons,
  IonBackButton,
} from "@ionic/vue";

import { syncPlaces, getGeoapifyCategory } from "@/services/place.service";
import { geocodeCity } from "@/services/geoapify.service";
import { downloadTilesForLocation } from "@/utils/OfflineTileLayer";

const selectedCountry = ref("id");
const cityQuery = ref("");
const loading = ref(false);
const progress = ref(0);
const successMessage = ref("");
const errorMessage = ref("");

async function downloadArea() {
  if (!cityQuery.value.trim()) return;

  loading.value = true;
  progress.value = 0;
  successMessage.value = "";
  errorMessage.value = "";

  try {
        const cityResult = await geocodeCity(cityQuery.value.trim(), selectedCountry.value);
    if (cityResult) {
      console.log("Mulai download map tiles...");
      await downloadTilesForLocation(cityResult.latitude, cityResult.longitude);
      console.log("Selesai download map tiles.");
    }
    
    const totalCategories = 12; // 1 to 12
    let successCount = 0;

    for (let i = 1; i <= totalCategories; i++) {
      const categoryStr = getGeoapifyCategory(i);
      try {
        await syncPlaces({
          city: cityQuery.value.trim(),
          countryCode: selectedCountry.value,
          categoryId: i,
          category: categoryStr,
          limit: 30,
          offset: 0,
        });
        successCount++;
      } catch (err) {
        console.warn(`Gagal unduh kategori ${i}`, err);
      }
      progress.value = Math.round((i / totalCategories) * 100);
    }

    if (successCount > 0) {
      successMessage.value = `Data untuk ${cityQuery.value} berhasil diunduh dan tersedia offline!`;
    } else {
      errorMessage.value = "Gagal mengunduh data. Pastikan koneksi internet stabil.";
    }
  } catch (error) {
    errorMessage.value = "Terjadi kesalahan saat mengunduh data.";
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.custom-content {
  --background: #f8fafc;
}
.custom-toolbar {
  --background: #ffffff;
}
.custom-title {
  font-weight: 700;
  color: #1e293b;
}
.header-text {
  margin-bottom: 20px;
}
.header-text h2 {
  font-weight: 800;
  color: #0f172a;
}
.header-text p {
  color: #64748b;
  font-size: 14px;
}
.modern-card {
  border-radius: 20px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
}
.modern-input {
  --background: #f1f5f9;
  border-radius: 12px;
  margin-top: 10px;
}
.progress-container {
  margin-top: 20px;
  padding: 10px;
  text-align: center;
}
.success-message {
  margin-top: 20px;
  padding: 16px;
  background: #dcfce7;
  color: #166534;
  border-radius: 12px;
  font-weight: 600;
}
.error-message {
  margin-top: 20px;
  padding: 16px;
  background: #fee2e2;
  color: #991b1b;
  border-radius: 12px;
  font-weight: 600;
}
.mt-2 { margin-top: 8px; }
.mt-4 { margin-top: 16px; }
</style>

