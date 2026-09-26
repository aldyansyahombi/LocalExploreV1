<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/places" />
        </ion-buttons>

        <ion-title>
          {{ isEditMode ? "Edit Tempat" : "Tambah Tempat" }}
        </ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">

      <!-- LOADING -->
      <div
        v-if="loading"
        class="state-container"
      >
        <ion-spinner name="crescent" />
        <p>Memuat data...</p>
      </div>

      <!-- FORM -->
      <form
        v-else
        @submit.prevent="handleSubmit"
      >

        <!-- NAMA -->
        <ion-item>
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
        <ion-item>
          <ion-select
            v-model="form.categoryId"
            label="Kategori"
            label-placement="stacked"
            placeholder="Pilih kategori"
            :disabled="saving"
          >
            <ion-select-option
              v-for="category in categories"
              :key="category.id"
              :value="category.id"
            >
              {{ category.icon }}
              {{ category.name }}
            </ion-select-option>
          </ion-select>
        </ion-item>

        <!-- ALAMAT -->
        <ion-item>
          <ion-textarea
            v-model="form.address"
            label="Alamat"
            label-placement="stacked"
            placeholder="Masukkan alamat tempat"
            :disabled="saving"
            :auto-grow="true"
          />
        </ion-item>

        <!-- KOTA -->
        <ion-item>
          <ion-input
            v-model="form.city"
            label="Kota"
            label-placement="stacked"
            placeholder="Contoh: Kendari"
            :disabled="saving"
          />
        </ion-item>

        <!-- PROVINSI -->
        <ion-item>
          <ion-input
            v-model="form.state"
            label="Provinsi"
            label-placement="stacked"
            placeholder="Contoh: Sulawesi Tenggara"
            :disabled="saving"
          />
        </ion-item>

        <!-- LATITUDE -->
        <ion-item>
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
        <ion-item>
          <ion-input
            v-model.number="form.longitude"
            type="number"
            label="Longitude"
            label-placement="stacked"
            placeholder="122.512"
            :disabled="saving"
          />
        </ion-item>

        <!-- DESKRIPSI -->
        <ion-item>
          <ion-textarea
            v-model="form.description"
            label="Deskripsi"
            label-placement="stacked"
            placeholder="Deskripsikan tempat ini..."
            :disabled="saving"
            :auto-grow="true"
          />
        </ion-item>

        <!-- GAMBAR -->
        <ion-item>
          <ion-input
            v-model="form.image"
            type="url"
            label="URL gambar"
            label-placement="stacked"
            placeholder="https://..."
            :disabled="saving"
          />
        </ion-item>

        <!-- ERROR -->
        <ion-text
          v-if="errorMessage"
          color="danger"
        >
          <p class="error-message">
            {{ errorMessage }}
          </p>
        </ion-text>

        <!-- SUBMIT -->
        <ion-button
          expand="block"
          type="submit"
          class="submit-button"
          :disabled="saving"
        >
          <ion-spinner
            v-if="saving"
            name="crescent"
          />

          <span v-else>
            {{ isEditMode
              ? "Simpan Perubahan"
              : "Tambah Tempat"
            }}
          </span>
        </ion-button>

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

.state-container {
  min-height: 60vh;

  display: flex;
  flex-direction: column;

  justify-content: center;
  align-items: center;

  text-align: center;
}

.error-message {
  margin: 16px 0;
}

.submit-button {
  margin-top: 24px;
}

</style>