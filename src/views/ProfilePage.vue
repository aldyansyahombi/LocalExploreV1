<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Profil</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">

      <!-- LOADING -->
      <div
        v-if="loading"
        class="state-container"
      >
        <ion-spinner name="crescent" />
        <p>Memuat profil...</p>
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

      <!-- PROFILE -->
      <div v-else-if="user">

        <!-- PROFILE HEADER -->
        <div class="profile-header">

          <div class="avatar">
            {{ getInitials(user.name) }}
          </div>

          <h2>
            {{ user.name }}
          </h2>

          <p>
            {{ user.email }}
          </p>

        </div>

        <!-- STATISTICS -->
        <div class="stats-container">

          <div class="stat-item">
            <strong>
              {{ favoriteCount }}
            </strong>

            <span>
              Favorit
            </span>
          </div>

          <div class="stat-item">
            <strong>
              {{ historyCount }}
            </strong>

            <span>
              Riwayat
            </span>
          </div>

        </div>

        <!-- PREFERENCES -->
        <ion-card>

          <ion-card-header>
            <ion-card-title>
              Preferensi
            </ion-card-title>
          </ion-card-header>

          <ion-card-content>

            <div
              v-if="user.preferences.length"
              class="preferences"
            >
              <ion-chip
                v-for="preference in user.preferences"
                :key="preference"
              >
                {{ preference }}
              </ion-chip>
            </div>

            <p v-else class="no-preferences">
              Belum ada preferensi kategori.
            </p>

          </ion-card-content>

        </ion-card>

        <!-- ACCOUNT -->
        <ion-card>

          <ion-card-header>
            <ion-card-title>
              Akun
            </ion-card-title>
          </ion-card-header>

          <ion-card-content>

            <ion-item lines="none">
              <ion-label>
                <h3>Nama</h3>
                <p>{{ user.name }}</p>
              </ion-label>
            </ion-item>

            <ion-item lines="none">
              <ion-label>
                <h3>Email</h3>
                <p>{{ user.email }}</p>
              </ion-label>
            </ion-item>

          </ion-card-content>

        </ion-card>

        <!-- LOGOUT -->
        <ion-button
          expand="block"
          color="danger"
          fill="outline"
          @click="handleLogout"
        >
          🚪 Logout
        </ion-button>

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
  IonChip,
  IonItem,
  IonLabel,
} from "@ionic/vue";

import BottomNavigation from "@/components/BottomNavigation.vue";

import type { User } from "@/db/types";

import {
  getUser,
  getUserFavorites,
  getUserVisitHistory,
} from "@/services/database.service";

import {
  getCurrentUserId,
  logout,
} from "@/services/auth.service";

const router = useRouter();

const user = ref<User | null>(null);

const favoriteCount = ref(0);

const historyCount = ref(0);

const loading = ref(true);

const errorMessage = ref("");

async function loadProfile() {
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

    const currentUser =
      await getUser(userId);

    if (!currentUser) {
      logout();

      router.push({
        name: "Login",
      });

      return;
    }

    user.value = currentUser;

    const favorites =
      await getUserFavorites(userId);

    favoriteCount.value =
      favorites.length;

    const history =
      await getUserVisitHistory(userId);

    historyCount.value =
      history.length;

  } catch (error) {

    console.error(
      "Gagal memuat profil:",
      error
    );

    errorMessage.value =
      error instanceof Error
        ? error.message
        : "Gagal memuat profil.";

  } finally {

    loading.value = false;

  }
}

function getInitials(
  name: string
): string {

  const words = name
    .trim()
    .split(/\s+/);

  if (words.length === 1) {
    return words[0]
      .slice(0, 2)
      .toUpperCase();
  }

  return (
    words[0][0] +
    words[1][0]
  ).toUpperCase();
}

function handleLogout() {

  logout();

  router.replace({
    name: "Login",
  });

}

onIonViewWillEnter(async () => {
  await loadProfile();
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

.profile-header {
  text-align: center;
  margin-bottom: 24px;
}

.avatar {
  width: 90px;
  height: 90px;

  margin: 0 auto 12px;

  border-radius: 50%;

  display: flex;
  align-items: center;
  justify-content: center;

  background:
    var(--ion-color-primary);

  color: white;

  font-size: 28px;
  font-weight: 700;
}

.profile-header h2 {
  margin-bottom: 4px;
}

.profile-header p {
  margin-top: 0;
  color: var(--ion-color-medium);
}

.stats-container {
  display: flex;

  margin-bottom: 20px;

  border-radius: 12px;

  background:
    var(--ion-color-light);
}

.stat-item {
  flex: 1;

  padding: 16px;

  display: flex;
  flex-direction: column;

  align-items: center;

  gap: 4px;
}

.stat-item strong {
  font-size: 24px;
}

.stat-item span {
  color:
    var(--ion-color-medium);
}

.preferences {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.no-preferences {
  color:
    var(--ion-color-medium);
}

.error-message {
  margin-top: 30px;
  text-align: center;
}

</style>