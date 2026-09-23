<template>
  <ion-page>

    <ion-header>
      <ion-toolbar>

        <ion-buttons slot="start">
          <ion-back-button
            default-href="/login"
          />
        </ion-buttons>

        <ion-title>
          Buat Akun
        </ion-title>

      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">

      <div class="register-container">

        <h1>Gabung Local Explore</h1>

        <p class="subtitle">
          Buat akun untuk menyimpan favorit
          dan mendapatkan rekomendasi.
        </p>

        <form @submit.prevent="handleRegister">

          <!-- NAME -->

          <ion-item>
            <ion-input
              v-model="name"
              label="Nama"
              label-placement="floating"
              placeholder="Nama lengkap"
              autocomplete="name"
              :disabled="loading"
            />
          </ion-item>

          <!-- EMAIL -->

          <ion-item>
            <ion-input
              v-model="email"
              type="email"
              label="Email"
              label-placement="floating"
              placeholder="nama@email.com"
              autocomplete="email"
              :disabled="loading"
            />
          </ion-item>

          <!-- PASSWORD -->

          <ion-item>
            <ion-input
              v-model="password"
              type="password"
              label="Password"
              label-placement="floating"
              placeholder="Minimal 6 karakter"
              autocomplete="new-password"
              :disabled="loading"
            />
          </ion-item>

          <!-- CONFIRM PASSWORD -->

          <ion-item>
            <ion-input
              v-model="confirmPassword"
              type="password"
              label="Konfirmasi Password"
              label-placement="floating"
              placeholder="Ulangi password"
              autocomplete="new-password"
              :disabled="loading"
            />
          </ion-item>

          <!-- PREFERENCES -->

          <div class="preferences">

            <h3>
              Apa yang kamu sukai?
            </h3>

            <p>
              Pilih kategori yang kamu minati.
            </p>

            <ion-list>
            <ion-item
                v-for="category in categories"
                :key="category.id"
            >
                <ion-checkbox
                :value="category.name"
                :checked="preferences.includes(category.name)"
                @ionChange="
                    togglePreference(
                    category.name,
                    $event.detail.checked
                    )
                "
                >
                {{ category.icon }} {{ category.name }}
                </ion-checkbox>
            </ion-item>
            </ion-list>

          </div>

          <!-- ERROR -->

          <ion-text
            v-if="errorMessage"
            color="danger"
          >
            <p class="error">
              {{ errorMessage }}
            </p>
          </ion-text>

          <!-- REGISTER -->

          <ion-button
            type="submit"
            expand="block"
            :disabled="loading"
          >

            <ion-spinner
              v-if="loading"
              name="crescent"
            />

            <span v-else>
              Buat Akun
            </span>

          </ion-button>

        </form>

        <div class="login-link">

          <span>
            Sudah punya akun?
          </span>

          <ion-button
            fill="clear"
            @click="goToLogin"
          >
            Login
          </ion-button>

        </div>

      </div>

    </ion-content>

  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";

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
  IonButton,
  IonText,
  IonSpinner,
  IonCheckbox,
  IonList,
} from "@ionic/vue";

import {
  getAllCategories,
} from "../services/database.service";

import {
  register,
} from "../services/auth.service";

import type { Category } from "../db/types";

const router = useRouter();

const name = ref("");
const email = ref("");
const password = ref("");
const confirmPassword = ref("");

const preferences = ref<string[]>([]);

const categories = ref<Category[]>([]);

const loading = ref(false);
const errorMessage = ref("");

onMounted(async () => {
  try {
    categories.value =
      await getAllCategories();
  } catch (error) {
    console.error(
      "Gagal mengambil kategori:",
      error
    );
  }
});

async function handleRegister() {
  errorMessage.value = "";

  // =========================
  // VALIDATION
  // =========================

  if (!name.value.trim()) {
    errorMessage.value =
      "Nama wajib diisi.";
    return;
  }

  if (name.value.trim().length < 3) {
    errorMessage.value =
      "Nama minimal 3 karakter.";
    return;
  }

  if (!email.value.trim()) {
    errorMessage.value =
      "Email wajib diisi.";
    return;
  }

  const emailRegex =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email.value)) {
    errorMessage.value =
      "Format email tidak valid.";
    return;
  }

  if (!password.value) {
    errorMessage.value =
      "Password wajib diisi.";
    return;
  }

  if (password.value.length < 6) {
    errorMessage.value =
      "Password minimal 6 karakter.";
    return;
  }

  if (
    password.value !==
    confirmPassword.value
  ) {
    errorMessage.value =
      "Konfirmasi password tidak cocok.";
    return;
  }

  loading.value = true;

  try {
    const user = await register(
      name.value,
      email.value,
      password.value,
      preferences.value
    );

    if (!user.id) {
      throw new Error(
        "Gagal membuat akun."
      );
    }

    // Setelah register langsung login
    localStorage.setItem(
      "local_explore_user_id",
      String(user.id)
    );

    await router.replace("/dashboard");

  } catch (error) {

    errorMessage.value =
      error instanceof Error
        ? error.message
        : "Gagal membuat akun.";

  } finally {
    loading.value = false;
  }
}

function goToLogin() {
  router.push("/login");
}
function togglePreference(categoryName: string, checked: boolean) {
  if (checked) {
    if (!preferences.value.includes(categoryName)) {
      preferences.value.push(categoryName);
    }
  } else {
    preferences.value = preferences.value.filter(
      (item) => item !== categoryName
    );
  }
}
</script>

<style scoped>
.register-container {
  max-width: 500px;
  margin: 0 auto;
}

h1 {
  margin-top: 12px;
}

.subtitle {
  color: var(--ion-color-medium);
  margin-bottom: 28px;
}

ion-item {
  margin-bottom: 12px;
}

.preferences {
  margin: 28px 0;
}

.preferences h3 {
  margin-bottom: 4px;
}

.preferences p {
  color: var(--ion-color-medium);
}

.error {
  margin: 16px 0;
}

.login-link {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 24px;
}
</style>