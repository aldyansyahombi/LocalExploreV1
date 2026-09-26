<template>
  <ion-page>

    <ion-header class="ion-no-border">
      <ion-toolbar class="custom-toolbar">
        <ion-buttons slot="start">
          <ion-back-button
            default-href="/login"
            class="custom-back-btn"
          />
        </ion-buttons>

        <ion-title class="custom-title">
          Buat Akun
        </ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="custom-content">

      <!-- ================================= -->
      <!-- HERO IMAGE BANNER -->
      <!-- ================================= -->
      <div class="register-hero">
        <img
          src="@/assets/gambar4.jpeg"
          alt="Adventure Background"
          class="hero-img"
        />
        <div class="hero-overlay"></div>

        <div class="hero-text fade-in">
          <div class="logo-box">
            <img 
              src="@/assets/logo_aplikasi.jpeg" 
              alt="Logo Aplikasi" 
              class="app-logo"
            />
          </div>
          <h1>Gabung Local Explore</h1>
          <p class="subtitle">
            Buat akun untuk menyimpan favorit dan rekomendasi tempat.
          </p>
        </div>
      </div>

      <!-- ================================= -->
      <!-- REGISTER FORM CONTAINER -->
      <!-- ================================= -->
      <div class="form-wrapper slide-up">
        <form @submit.prevent="handleRegister">

          <!-- INPUT FIELDS GROUP -->
          <div class="input-group">
            <!-- NAME -->
            <ion-item class="modern-input" lines="none">
              <ion-input
                v-model="name"
                label="Nama Lengkap"
                label-placement="stacked"
                placeholder="Contoh: La Ode"
                autocomplete="name"
                :disabled="loading"
              />
            </ion-item>

            <!-- EMAIL -->
            <ion-item class="modern-input" lines="none">
              <ion-input
                v-model="email"
                type="email"
                label="Alamat Email"
                label-placement="stacked"
                placeholder="nama@email.com"
                autocomplete="email"
                :disabled="loading"
              />
            </ion-item>

            <!-- PASSWORD -->
            <ion-item class="modern-input" lines="none">
              <ion-input
                v-model="password"
                type="password"
                label="Password"
                label-placement="stacked"
                placeholder="Minimal 6 karakter"
                autocomplete="new-password"
                :disabled="loading"
              />
            </ion-item>

            <!-- CONFIRM PASSWORD -->
            <ion-item class="modern-input" lines="none">
              <ion-input
                v-model="confirmPassword"
                type="password"
                label="Konfirmasi Password"
                label-placement="stacked"
                placeholder="Ulangi password kamu"
                autocomplete="new-password"
                :disabled="loading"
              />
            </ion-item>
          </div>

          <!-- PREFERENCES SECTION -->
          <div class="preferences-section">
            <div class="pref-header">
              <h3>🏷️ Apa yang kamu sukai?</h3>
              <p>Pilih kategori tempat yang ingin kamu jelajahi.</p>
            </div>

            <ion-list class="pref-list" lines="none">
              <ion-item
                v-for="category in categories"
                :key="category.id"
                class="pref-item"
              >
                <ion-checkbox
                  class="pref-checkbox"
                  :value="category.name"
                  :checked="preferences.includes(category.name)"
                  @ionChange="
                    togglePreference(
                      category.name,
                      $event.detail.checked
                    )
                  "
                >
                  <span class="pref-label-text">
                    {{ category.icon }} {{ category.name }}
                  </span>
                </ion-checkbox>
              </ion-item>
            </ion-list>
          </div>

          <!-- ERROR -->
          <ion-text
            v-if="errorMessage"
            color="danger"
          >
            <div class="error-box fade-in">
              <span class="error-icon">⚠️</span>
              <p class="error">{{ errorMessage }}</p>
            </div>
          </ion-text>

          <!-- REGISTER BUTTON -->
          <ion-button
            type="submit"
            expand="block"
            shape="round"
            class="submit-button"
            :disabled="loading"
          >
            <ion-spinner
              v-if="loading"
              name="crescent"
            />
            <span v-else>
              Buat Akun Sekarang
            </span>
          </ion-button>

        </form>

        <!-- LOGIN LINK -->
        <div class="login-link-wrapper">
          <span>Sudah punya akun?</span>
          <ion-button
            fill="clear"
            class="login-btn-link"
            @click="goToLogin"
          >
            Login di sini
          </ion-button>

        </div>
        <p class="privacy-link">
          Dengan mendaftar, Anda menyetujui penggunaan aplikasi
          sesuai dengan
          <a @click="goToPrivacyPolicy">
            Kebijakan Privasi
          </a>.
        </p>

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
function goToPrivacyPolicy() {
  router.push("/privacy-policy");
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
/* ====================
   GLOBAL STYLES 
   ==================== */
.custom-content {
  --background: #ffffff;
}

.custom-toolbar {
  --background: #ffffff;
  --box-shadow: none;
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
   HERO IMAGE SECTION
   ==================== */
.register-hero {
  position: relative;
  width: 100%;
  height: 32vh;
  min-height: 260px;
}

.hero-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.hero-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.85) 100%);
}

.hero-text {
  position: absolute;
  bottom: 30px;
  left: 20px;
  right: 20px;
  text-align: center;
  color: white;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.logo-box {
  width: 60px;
  height: 60px;
  margin-bottom: 8px;
  border-radius: 16px;
  background: #ffffff;
  padding: 3px;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.app-logo {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 12px;
}

.hero-text h1 {
  font-size: 24px;
  font-weight: 800;
  margin: 0 0 4px;
  text-shadow: 0 2px 4px rgba(0,0,0,0.5);
}

.subtitle {
  font-size: 13px;
  margin: 0;
  color: #e2e8f0;
  text-shadow: 0 1px 3px rgba(0,0,0,0.5);
  max-width: 300px;
}

/* ====================
   FORM WRAPPER
   ==================== */
.form-wrapper {
  position: relative;
  margin-top: -24px;
  background: white;
  border-top-left-radius: 32px;
  border-top-right-radius: 32px;
  padding: 30px 20px 40px;
  z-index: 3;
  box-shadow: 0 -10px 20px rgba(0,0,0,0.05);
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
}

/* ====================
   MODERN INPUTS
   ==================== */
.modern-input {
  --background: #f8fafc;
  --padding-start: 16px;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  transition: all 0.3s;
}

.modern-input.item-has-focus {
  border-color: #4f46e5;
  --background: #ffffff;
  box-shadow: 0 4px 12px rgba(79, 70, 229, 0.05);
}

ion-input {
  font-size: 14px;
  color: #0f172a;
}

ion-input::part(label) {
  font-weight: 600;
  color: #64748b;
  font-size: 12px;
  margin-bottom: 4px;
}

/* ====================
   PREFERENCES SECTION
   ==================== */
.preferences-section {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 20px;
  padding: 16px;
  margin-bottom: 20px;
}

.pref-header h3 {
  font-size: 15px;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 2px;
}

.pref-header p {
  font-size: 12px;
  color: #64748b;
  margin: 0 0 12px;
}

.pref-list {
  background: transparent;
  padding: 0;
}

.pref-item {
  --background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  margin-bottom: 8px;
  --padding-start: 12px;
  --min-height: 44px;
}

.pref-checkbox {
  font-size: 14px;
  font-weight: 600;
  color: #334155;
  width: 100%;
}

.pref-label-text {
  margin-left: 8px;
}

/* ====================
   BUTTONS
   ==================== */
.submit-button {
  height: 52px;
  font-size: 15px;
  font-weight: 700;
  margin: 0;
  --box-shadow: 0 8px 20px rgba(var(--ion-color-primary-rgb), 0.25);
}

/* ====================
   LOGIN LINK
   ==================== */
.login-link-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 20px;
  gap: 4px;
}

.login-link-wrapper span {
  font-size: 13px;
  color: #64748b;
}

.login-btn-link {
  font-weight: 700;
  font-size: 13px;
  --color: #4f46e5;
  margin: 0;
  --padding-start: 4px;
  --padding-end: 4px;
}

/* ====================
   ERROR MESSAGE
   ==================== */
.error-box {
  display: flex;
  align-items: center;
  gap: 10px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  padding: 12px 16px;
  border-radius: 12px;
  color: #b91c1c;
  margin-bottom: 16px;
}

.error-icon {
  font-size: 20px;
}

.error {
  margin: 0;
  font-size: 13px;
  font-weight: 500;
}

/* ====================
   ANIMATIONS
   ==================== */
.fade-in {
  animation: fadeIn 0.8s ease-in-out;
}

.slide-up {
  animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>