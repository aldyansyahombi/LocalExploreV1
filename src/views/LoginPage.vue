<template>
  <ion-page>
    <ion-content class="ion-padding">
      <div class="login-container">

        <div class="logo">
          🌍
        </div>

        <h1>Local Explore</h1>

        <p class="subtitle">
          Temukan tempat menarik di sekitarmu.
        </p>

        <form @submit.prevent="handleLogin">

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

          <ion-item>
            <ion-input
              v-model="password"
              type="password"
              label="Password"
              label-placement="floating"
              placeholder="Masukkan password"
              autocomplete="current-password"
              :disabled="loading"
            />
          </ion-item>

          <ion-text
            v-if="errorMessage"
            color="danger"
          >
            <p class="error">
              {{ errorMessage }}
            </p>
          </ion-text>

          <ion-button
            type="submit"
            expand="block"
            class="login-button"
            :disabled="loading"
          >
            <ion-spinner
              v-if="loading"
              name="crescent"
            />

            <span v-else>Login</span>
          </ion-button>

        </form>

        <div class="register-link">
          <span>Belum punya akun?</span>

          <ion-button
            fill="clear"
            @click="goToRegister"
          >
            Daftar
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
.login-container {
  max-width: 420px;
  margin: 0 auto;
  padding-top: 15vh;
  text-align: center;
}

.logo {
  font-size: 64px;
}

h1 {
  margin-bottom: 8px;
}

.subtitle {
  color: var(--ion-color-medium);
  margin-bottom: 32px;
}

ion-item {
  margin-bottom: 12px;
}

.login-button {
  margin-top: 24px;
}

.error {
  text-align: left;
  margin: 12px 0;
}

.register-link {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 24px;
}
</style>