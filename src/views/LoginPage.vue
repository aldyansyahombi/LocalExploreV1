<template>
  <ion-page>
    <ion-content class="custom-content">

      <!-- ================================= -->
      <!-- HERO IMAGE & GREETING -->
      <!-- ================================= -->
      <div class="login-hero">
        <!-- Background Hero Unsplash -->
        <img
          src="@/assets/gambar3.jpeg"
          alt="Explore World"
          class="hero-img"
        />
        <div class="hero-overlay"></div>

        <div class="hero-text fade-in">
          <!-- LOGO APLIKASI ASLI -->
          <div class="logo-box">
            <img 
              src="@/assets/logo_aplikasi.jpeg" 
              alt="Logo Aplikasi" 
              class="app-logo"
            />
          </div>
          
          <h1>Local Explore</h1>
          <p class="subtitle">
            Temukan tempat menarik di sekitarmu.
          </p>
        </div>
      </div>

      <!-- ================================= -->
      <!-- LOGIN FORM -->
      <!-- ================================= -->
      <div class="form-wrapper slide-up">
        <form @submit.prevent="handleLogin" class="login-form">

          <div class="input-group">
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

            <ion-item class="modern-input" lines="none">
              <ion-input
                v-model="password"
                type="password"
                label="Password"
                label-placement="stacked"
                placeholder="Masukkan password"
                autocomplete="current-password"
                :disabled="loading"
              />
            </ion-item>
          </div>

          <!-- ERROR MESSAGE -->
          <ion-text
            v-if="errorMessage"
            color="danger"
          >
            <div class="error-box fade-in">
              <span class="error-icon">⚠️</span>
              <p class="error">{{ errorMessage }}</p>
            </div>
          </ion-text>

          <!-- SUBMIT BUTTON -->
          <ion-button
            type="submit"
            expand="block"
            shape="round"
            class="login-button"
            :disabled="loading"
          >
            <ion-spinner
              v-if="loading"
              name="crescent"
            />
            <span v-else>Login ke Akun</span>
          </ion-button>

        </form>

        <!-- REGISTER LINK -->
        <div class="register-wrapper">
          <span class="register-text">Belum punya akun?</span>
          <ion-button
            fill="clear"
            class="register-btn"
            @click="goToRegister"
          >
            Daftar di sini
          </ion-button>
        </div>
      </div>

    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";

import {
  IonPage,
  IonContent,
  IonItem,
  IonInput,
  IonButton,
  IonText,
  IonSpinner,
} from "@ionic/vue";

import { login } from "../services/auth.service";

const router = useRouter();

const email = ref("");
const password = ref("");

const loading = ref(false);
const errorMessage = ref("");

async function handleLogin() {
  errorMessage.value = "";

  if (!email.value.trim()) {
    errorMessage.value =
      "Email wajib diisi.";

    return;
  }

  if (!email.value.includes("@")) {
    errorMessage.value =
      "Format email tidak valid.";

    return;
  }

  if (!password.value) {
    errorMessage.value =
      "Password wajib diisi.";

    return;
  }

  loading.value = true;

  try {
    await login(
      email.value,
      password.value
    );

    await router.replace("/dashboard");
  } catch (error) {
    errorMessage.value =
      error instanceof Error
        ? error.message
        : "Terjadi kesalahan saat login.";
  } finally {
    loading.value = false;
  }
}

function goToRegister() {
  router.push("/register");
}
</script>

<style scoped>
/* ====================
   GLOBAL STYLES 
   ==================== */
.custom-content {
  --background: #ffffff;
}

/* ====================
   HERO IMAGE SECTION
   ==================== */
.login-hero {
  position: relative;
  width: 100%;
  height: 45vh; /* Mengambil 45% dari tinggi layar */
  min-height: 320px;
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
  background: linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.8) 100%);
}

.hero-text {
  position: absolute;
  bottom: 50px;
  left: 20px;
  right: 20px;
  text-align: center;
  color: white;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* ====================
   LOGO APLIKASI (BARU)
   ==================== */
.logo-box {
  width: 80px;
  height: 80px;
  margin-bottom: 12px;
  border-radius: 20px; /* Ganti jadi 50% kalau mau bentuk bulat penuh */
  background: #ffffff;
  padding: 4px; /* Memberikan sedikit ruang putih di pinggir logo */
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.25);
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.app-logo {
  width: 100%;
  height: 100%;
  object-fit: cover; /* Ganti jadi 'contain' kalau logo kamu terpotong */
  border-radius: 16px; /* Ganti jadi 50% kalau logo-box nya dibikin bulat penuh */
}

/* ====================
   TYPOGRAPHY
   ==================== */
.hero-text h1 {
  font-size: 32px;
  font-weight: 800;
  margin: 0 0 8px;
  letter-spacing: 0.5px;
  text-shadow: 0 2px 4px rgba(0,0,0,0.5);
}

.subtitle {
  font-size: 15px;
  margin: 0;
  color: #f1f5f9;
  text-shadow: 0 1px 3px rgba(0,0,0,0.5);
}

/* ====================
   FORM WRAPPER
   ==================== */
.form-wrapper {
  position: relative;
  margin-top: -30px; 
  background: white;
  border-top-left-radius: 32px;
  border-top-right-radius: 32px;
  padding: 36px 24px 40px;
  min-height: 55vh;
  z-index: 3;
  box-shadow: 0 -10px 20px rgba(0,0,0,0.05);
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 24px;
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
  font-size: 15px;
  color: #0f172a;
}

ion-input::part(label) {
  font-weight: 600;
  color: #64748b;
  font-size: 13px;
  margin-bottom: 4px;
}

/* ====================
   BUTTONS
   ==================== */
.login-button {
  height: 54px;
  font-size: 16px;
  font-weight: 700;
  margin: 0;
  --box-shadow: 0 8px 20px rgba(var(--ion-color-primary-rgb), 0.3);
}

/* ====================
   REGISTER LINK
   ==================== */
.register-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 24px;
  gap: 4px;
}

.register-text {
  font-size: 14px;
  color: #64748b;
}

.register-btn {
  font-weight: 700;
  font-size: 14px;
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
  margin-bottom: 20px;
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
  from { opacity: 0; transform: translateY(40px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>