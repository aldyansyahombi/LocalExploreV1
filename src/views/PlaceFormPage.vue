<template>
  <ion-page>
    <!-- HEADER -->
    <ion-header class="ion-no-border">
      <ion-toolbar class="custom-toolbar">
        <ion-buttons slot="start">
          <ion-back-button default-href="/places" class="custom-back-btn" />
        </ion-buttons>

        <ion-title class="custom-title">
          {{ isEditMode ? "Edit Tempat" : "Tambah Tempat" }}
        </ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="custom-content ion-padding">

      <!-- LOADING -->
      <div
        v-if="loading"
        class="state-container fade-in"
      >
        <div class="spinner-wrapper">
          <ion-spinner name="crescent" color="primary" />
        </div>
        <p>Memuat formulir...</p>
      </div>

      <!-- FORM -->
      <form
        v-else
        @submit.prevent="handleSubmit"
        class="form-container fade-in"
      >
        <!-- FORM HEADER -->
        <div class="form-header">
          <div class="header-icon">
            {{ isEditMode ? "📝" : "✨" }}
          </div>
          <h2>{{ isEditMode ? "Perbarui Data" : "Tempat Baru" }}</h2>
          <p>Lengkapi informasi di bawah ini.</p>
        </div>

        <!-- ========================== -->
        <!-- INFORMASI UTAMA -->
        <!-- ========================== -->
        <div class="form-section modern-card">
          <h3 class="section-title">
            <span class="title-icon">🏷️</span> Informasi Utama
          </h3>

          <!-- NAMA -->
          <ion-item class="modern-input" lines="none">
            <ion-input
              v-model="form.name"
              label="Nama tempat"
              label-placement="stacked"
              placeholder="Contoh: Taman Kota Kendari"
              :disabled="saving"
              required
            />
          </ion-item>

          <!-- KATEGORI -->
          <ion-item class="modern-input" lines="none">
            <ion-select
              v-model="form.categoryId"
              label="Kategori"
              label-placement="stacked"
              placeholder="Pilih kategori"
              interface="popover"
              :disabled="saving"
            >
              <ion-select-option
                v-for="category in categories"
                :key="category.id"
                :value="category.id"
              >
                {{ category.icon }} {{ category.name }}
              </ion-select-option>
            </ion-select>
          </ion-item>
        </div>

        <!-- ========================== -->
        <!-- DETAIL LOKASI -->
        <!-- ========================== -->
        <div class="form-section modern-card">
          <h3 class="section-title">
            <span class="title-icon">📍</span> Detail Lokasi
          </h3>

          <!-- ALAMAT -->
          <ion-item class="modern-input" lines="none">
            <ion-textarea
              v-model="form.address"
              label="Alamat lengkap"
              label-placement="stacked"
              placeholder="Masukkan alamat tempat"
              :disabled="saving"
              :auto-grow="true"
            />
          </ion-item>

          <!-- KOTA & PROVINSI (GRID LAYOUT) -->
          <div class="grid-2-col">
            <!-- KOTA -->
            <ion-item class="modern-input" lines="none">
              <ion-input
                v-model="form.city"
                label="Kota"
                label-placement="stacked"
                placeholder="Ex: Kendari"
                :disabled="saving"
              />
            </ion-item>

            <!-- PROVINSI -->
            <ion-item class="modern-input" lines="none">
              <ion-input
                v-model="form.state"
                label="Provinsi"
                label-placement="stacked"
                placeholder="Ex: Sultra"
                :disabled="saving"
              />
            </ion-item>
          </div>

          <!-- KOORDINAT (GRID LAYOUT) -->
          <div class="grid-2-col mt-2">
            <!-- LATITUDE -->
            <ion-item class="modern-input" lines="none">
              <ion-input
                v-model.number="form.latitude"
                type="number"
                label="Latitude"
                label-placement="stacked"
                placeholder="-3.998"
                :disabled="saving"
              />
            </ion-item>

            <!-- LONGITUDE -->
            <ion-item class="modern-input" lines="none">
              <ion-input
                v-model.number="form.longitude"
                type="number"
                label="Longitude"
                label-placement="stacked"
                placeholder="122.512"
                :disabled="saving"
              />
            </ion-item>
          </div>
        </div>

        <!-- ========================== -->
        <!-- DESKRIPSI & MEDIA -->
        <!-- ========================== -->
        <div class="form-section modern-card">
          <h3 class="section-title">
            <span class="title-icon">🖼️</span> Deskripsi & Media
          </h3>

          <!-- DESKRIPSI -->
          <ion-item class="modern-input" lines="none">
            <ion-textarea
              v-model="form.description"
              label="Deskripsi"
              label-placement="stacked"
              placeholder="Ceritakan tentang tempat ini..."
              :disabled="saving"
              :auto-grow="true"
            />
          </ion-item>

          <!-- GAMBAR -->
          <ion-item class="modern-input" lines="none">
            <ion-input
              v-model="form.image"
              type="url"
              label="URL Gambar"
              label-placement="stacked"
              placeholder="https://..."
              :disabled="saving"
            />
          </ion-item>
        </div>

        <!-- ERROR -->
        <ion-text
          v-if="errorMessage"
          color="danger"
        >
          <div class="error-box">
            <span class="error-icon">⚠️</span>
            <div>
              <strong>Oops, ada masalah!</strong>
              <p>{{ errorMessage }}</p>
            </div>
          </div>
        </ion-text>

        <!-- SUBMIT BUTTON -->
        <div class="submit-wrapper">
          <ion-button
            expand="block"
            type="submit"
            shape="round"
            class="submit-button"
            :disabled="saving"
          >
            <ion-spinner
              v-if="saving"
              name="crescent"
            />
            <span v-else>
              {{ isEditMode ? "💾 Simpan Perubahan" : "➕ Tambah Tempat" }}
            </span>
          </ion-button>
        </div>

      </form>

    </ion-content>

    <BottomNavigation />

  </ion-page>
</template>

<script setup lang="ts">
import {
  computed,
  onMounted,
  reactive,
  ref,
} from "vue";

import {
  useRoute,
  useRouter,
} from "vue-router";

import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonBackButton,
  IonItem,
  IonInput,
  IonTextarea,
  IonSelect,
  IonSelectOption,
  IonButton,
  IonSpinner,
  IonText,
} from "@ionic/vue";

import BottomNavigation from "@/components/BottomNavigation.vue";

import type {
  Category,
  Place,
} from "@/db/types";

import {
  getAllCategories,
  getPlace,
  createPlace,
  updatePlace,
} from "@/services/database.service";

const router = useRouter();
const route = useRoute();

const categories = ref<Category[]>([]);

const loading = ref(true);
const saving = ref(false);

const errorMessage = ref("");

const form = reactive({
  name: "",
  categoryId: undefined as number | undefined,
  address: "",
  city: "",
  state: "",
  latitude: 0,
  longitude: 0,
  description: "",
  image: "",
});

const placeId = computed(() => {

  const value = route.params.id;

  if (typeof value !== "string") {
    return undefined;
  }

  const id = Number(value);

  return Number.isNaN(id)
    ? undefined
    : id;
});

const isEditMode = computed(
  () => placeId.value !== undefined
);

async function loadCategories() {

  categories.value =
    await getAllCategories();

}

async function loadPlace() {

  if (!isEditMode.value) {
    return;
  }

  if (!placeId.value) {
    throw new Error(
      "ID tempat tidak valid."
    );
  }

  const place =
    await getPlace(placeId.value);

  if (!place) {
    throw new Error(
      "Tempat tidak ditemukan."
    );
  }

  // Hanya tempat lokal yang boleh diedit
  if (place.source !== "local") {
    throw new Error(
      "Tempat dari Geoapify tidak dapat diedit."
    );
  }

  form.name = place.name;
  form.categoryId = place.categoryId;
  form.address = place.address;
  form.city = place.city ?? "";
  form.state = place.state ?? "";
  form.latitude = place.latitude;
  form.longitude = place.longitude;
  form.description =
    place.description ?? "";
  form.image = place.image ?? "";

}

function validateForm(): boolean {

  errorMessage.value = "";

  if (!form.name.trim()) {
    errorMessage.value =
      "Nama tempat wajib diisi.";
    return false;
  }

  if (!form.categoryId) {
    errorMessage.value =
      "Kategori wajib dipilih.";
    return false;
  }

  if (!form.address.trim()) {
    errorMessage.value =
      "Alamat wajib diisi.";
    return false;
  }

  if (
    !Number.isFinite(form.latitude) ||
    form.latitude < -90 ||
    form.latitude > 90
  ) {
    errorMessage.value =
      "Latitude harus berada antara -90 dan 90.";
    return false;
  }

  if (
    !Number.isFinite(form.longitude) ||
    form.longitude < -180 ||
    form.longitude > 180
  ) {
    errorMessage.value =
      "Longitude harus berada antara -180 dan 180.";
    return false;
  }

  return true;

}

async function handleSubmit() {

  if (!validateForm()) {
    return;
  }

  saving.value = true;
  errorMessage.value = "";

  try {

    if (isEditMode.value) {

      if (!placeId.value) {
        throw new Error(
          "ID tempat tidak valid."
        );
      }

      const existingPlace =
        await getPlace(placeId.value);

      if (!existingPlace) {
        throw new Error(
          "Tempat tidak ditemukan."
        );
      }

      const updatedPlace: Place = {
        ...existingPlace,
        id: placeId.value,
        name: form.name.trim(),

        categoryId:
          form.categoryId!,

        address:
          form.address.trim(),

        city:
          form.city.trim() || undefined,

        state:
          form.state.trim() || undefined,

        latitude:
          form.latitude,

        longitude:
          form.longitude,

        description:
          form.description.trim() ||
          undefined,

        image:
          form.image.trim() ||
          undefined,

        updatedAt:
          new Date().toISOString(),
      };

      await updatePlace(
        updatedPlace
      );

      router.replace({
        name: "PlaceDetail",
        params: {
          id: placeId.value,
        },
      });

    } else {

      const newPlace: Place = {
        name: form.name.trim(),

        categoryId:
          form.categoryId!,

        latitude:
          form.latitude,

        longitude:
          form.longitude,

        address:
          form.address.trim(),

        city:
          form.city.trim() || undefined,

        state:
          form.state.trim() || undefined,

        description:
          form.description.trim() ||
          undefined,

        image:
          form.image.trim() ||
          undefined,

        source: "local",

        createdAt:
          new Date().toISOString(),
      };

      const id =
        await createPlace(newPlace);

      router.replace({
        name: "PlaceDetail",
        params: {
          id,
        },
      });

    }

  } catch (error) {

    console.error(
      "Gagal menyimpan tempat:",
      error
    );

    errorMessage.value =
      error instanceof Error
        ? error.message
        : "Gagal menyimpan tempat.";

  } finally {

    saving.value = false;

  }

}

onMounted(async () => {

  try {

    await loadCategories();
    await loadPlace();

  } catch (error) {

    console.error(
      "Gagal memuat form:",
      error
    );

    errorMessage.value =
      error instanceof Error
        ? error.message
        : "Gagal memuat data.";

  } finally {

    loading.value = false;

  }

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
  font-size: 18px;
  color: #1e293b;
}

.custom-back-btn {
  color: #4f46e5;
}

/* ====================
   FORM HEADER 
   ==================== */
.form-container {
  padding-bottom: 30px;
}

.form-header {
  text-align: center;
  margin-bottom: 24px;
  margin-top: 10px;
}

.header-icon {
  font-size: 40px;
  width: 70px;
  height: 70px;
  background: #e0e7ff;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 12px;
  box-shadow: 0 8px 16px rgba(67, 56, 202, 0.15);
}

.form-header h2 {
  font-size: 22px;
  font-weight: 800;
  color: #0f172a;
  margin: 0 0 6px;
}

.form-header p {
  font-size: 14px;
  color: #64748b;
  margin: 0;
}

/* ====================
   FORM SECTIONS (CARDS)
   ==================== */
.form-section {
  padding: 20px 16px;
  margin-bottom: 20px;
}

.modern-card {
  border-radius: 24px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.03);
  background: white;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 16px;
}

.title-icon {
  font-size: 20px;
}

/* ====================
   MODERN INPUT FIELDS
   ==================== */
.modern-input {
  --background: #f8fafc;
  --padding-start: 16px;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  margin-bottom: 14px;
  transition: border-color 0.3s;
}

/* Optional: Slight border change when active/focused */
.modern-input.item-has-focus {
  border-color: #4f46e5;
  --background: #ffffff;
  box-shadow: 0 4px 12px rgba(79, 70, 229, 0.05);
}

/* Specifically styling the label and input text inside ion-item */
ion-input, ion-textarea, ion-select {
  font-size: 14px;
  color: #0f172a;
}

ion-input::part(label), ion-textarea::part(label), ion-select::part(label) {
  font-weight: 600;
  color: #64748b;
  font-size: 13px;
  margin-bottom: 4px;
}

/* ====================
   GRID LAYOUT
   ==================== */
.grid-2-col {
  display: flex;
  gap: 12px;
}

.grid-2-col > ion-item {
  flex: 1;
  margin-bottom: 0;
}

.mt-2 {
  margin-top: 14px;
}

/* ====================
   ERROR MESSAGE 
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
  margin-bottom: 20px;
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
   SUBMIT BUTTON 
   ==================== */
.submit-wrapper {
  margin-top: 24px;
  margin-bottom: 20px;
}

.submit-button {
  --box-shadow: 0 8px 20px rgba(var(--ion-color-primary-rgb), 0.25);
  font-weight: 700;
  margin: 0;
  font-size: 16px;
  height: 52px;
}

/* ====================
   LOADING STATE
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
}

.state-container p {
  color: #64748b;
  font-size: 14px;
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