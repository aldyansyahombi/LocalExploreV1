<template>
  <ion-footer class="bottom-navigation">
    <ion-toolbar>
      <div class="bottom-nav-container">

        <!-- HOME -->
        <button
          class="nav-item"
          :class="{ active: currentRoute === 'Dashboard' }"
          type="button"
          @click="goToDashboard"
        >
          <ion-icon :icon="homeOutline" />
          <span>Home</span>
        </button>

        <!-- EXPLORE -->
        <button
          class="nav-item"
          :class="{ active: currentRoute === 'Places' }"
          type="button"
          @click="goToPlaces"
        >
          <ion-icon :icon="compassOutline" />
          <span>Explore</span>
        </button>

        <!-- FAVORITES -->
        <button
          class="nav-item"
          :class="{ active: currentRoute === 'Favorites' }"
          type="button"
          @click="goToFavorites"
        >
          <ion-icon :icon="heartOutline" />
          <span>Favorit</span>
        </button>

        <!-- HISTORY -->
        <button
          class="nav-item"
          :class="{ active: currentRoute === 'History' }"
          type="button"
          @click="goToHistory"
        >
          <ion-icon :icon="timeOutline" />
          <span>Riwayat</span>
        </button>

        <!-- PROFILE -->
        <button
          class="nav-item"
          :class="{ active: currentRoute === 'Profile' }"
          type="button"
          @click="goToProfile"
        >
          <ion-icon :icon="personOutline" />
          <span>Profil</span>
        </button>

      </div>
    </ion-toolbar>
  </ion-footer>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";


import {
  IonFooter,
  IonToolbar,
  IonIcon,
} from "@ionic/vue";

import {
  homeOutline,
  compassOutline,
  heartOutline,
  timeOutline,
  personOutline,
} from "ionicons/icons";

const router = useRouter();
const route = useRoute();

const currentRoute = computed(
  () => route.name
);

function goToDashboard() {
  router.push({
    name: "Dashboard",
  });
}

function goToPlaces() {
  router.push({
    name: "Places",
  });
}

function goToFavorites() {
  router.push({
    name: "Favorites",
  });
}

function goToHistory() {
  router.push({
    name: "History",
  });
}

function goToProfile() {
  router.push({
    name: "Profile",
  });
}
</script>

<style scoped>
.bottom-navigation {
  border-top: 1px solid
    var(--ion-color-light-shade);
}

.bottom-nav-container {
  display: flex;
  justify-content: space-around;
  align-items: center;
}

.nav-item {
  flex: 1;
  border: none;
  background: transparent;
  padding: 8px 4px;

  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;

  color: var(--ion-color-medium);
  font-size: 11px;
}

.nav-item ion-icon {
  font-size: 22px;
}

.nav-item.active {
  color: var(--ion-color-primary);
  font-weight: 600;
}
</style>