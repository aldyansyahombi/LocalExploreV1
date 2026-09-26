<template>
  <ion-page>

    <!-- ================================= -->
    <!-- HEADER -->
    <!-- ================================= -->

    <ion-header class="ion-no-border">
      <ion-toolbar>

        <ion-title>
          Local Explore
        </ion-title>

      </ion-toolbar>
    </ion-header>


    <!-- ================================= -->
    <!-- CONTENT -->
    <!-- ================================= -->

    <ion-content>

      <div class="dashboard-container">

        <!-- ================================= -->
        <!-- GREETING -->
        <!-- ================================= -->

        <section class="greeting-section">

          <p class="greeting-small">
            Selamat datang 👋
          </p>

          <h1>
            Halo, {{ userName }}
          </h1>

          <p class="greeting-description">
            Mau eksplor apa hari ini?
          </p>

        </section>


        <!-- ================================= -->
        <!-- SEARCH -->
        <!-- ================================= -->

        


        <!-- ================================= -->
        <!-- CATEGORIES -->
        <!-- ================================= -->

        <section class="category-section">

          <div class="section-header">

            <h2>
              Kategori
            </h2>

            <ion-button
              fill="clear"
              size="small"
              @click="goToPlaces"
            >
              Lihat semua
            </ion-button>

          </div>


          <!-- CATEGORY LOADING -->

          <div
            v-if="loadingCategories"
            class="category-loading"
          >

            <ion-spinner name="crescent" />

            <span>
              Memuat kategori...
            </span>

          </div>


          <!-- CATEGORY EMPTY -->

          <div
            v-else-if="categories.length === 0"
            class="empty-state"
          >

            <ion-icon
              :icon="folderOpenOutline"
            />

            <p>
              Belum ada kategori.
            </p>

          </div>


          <!-- CATEGORY CARDS -->

          <div
            v-else
            class="category-grid"
          >

            <button
              v-for="category in categories"
              :key="category.id"
              class="category-card"
              type="button"
              @click="selectCategory(category.id)"
            >

              <div class="category-icon">

                {{ category.icon }}

              </div>

              <span class="category-name">

                {{ category.name }}

              </span>

            </button>

          </div>

        </section>


        <!-- ================================= -->
        <!-- NEARBY PLACE PLACEHOLDER -->
        <!-- ================================= -->

        <section class="place-section">

          <div class="section-header">

            <div>

              <h2>
                Di sekitar kamu
              </h2>

              <p class="section-description">
                Tempat menarik di dekat lokasimu
              </p>

            </div>

            <ion-button
              fill="clear"
              size="small"
              @click="goToPlaces"
            >
              Lihat semua
            </ion-button>

          </div>


          <!-- LOCATION PLACEHOLDER -->

          <ion-card class="location-card">
            <ion-card-header>
              <ion-card-title>
                📍 Jelajahi berdasarkan lokasi
              </ion-card-title>
            </ion-card-header>

            <ion-card-content>

              <ion-segment
                v-model="locationMode"
              >
                <ion-segment-button value="current">
                  <ion-label>
                    Lokasi Saya
                  </ion-label>
                </ion-segment-button>

                <ion-segment-button value="manual">
                  <ion-label>
                    Pilih Kota
                  </ion-label>
                </ion-segment-button>
              </ion-segment>

              <!-- GPS -->
              <div
                v-if="locationMode === 'current'"
                class="location-action"
              >
                <p>
                  Temukan tempat menarik
                  di sekitar posisi kamu.
                </p>

                <ion-button
                  expand="block"
                  :disabled="loadingPlaces"
                  @click="searchNearby"
                >
                  <ion-spinner
                    v-if="loadingPlaces"
                    name="crescent"
                  />

                  <span v-else>
                    📍 Gunakan lokasi saya
                  </span>
                </ion-button>
              </div>

              <!-- MANUAL -->
              <div
                v-else
                class="location-action"
              >
                <ion-item>
                  <ion-label position="stacked">
                    Negara
                  </ion-label>

                  <ion-select
                    v-model="selectedCountry"
                    interface="popover"
                  >
                    <ion-select-option value="id">
                      🇮🇩 Indonesia
                    </ion-select-option>

                    <ion-select-option value="my">
                      🇲🇾 Malaysia
                    </ion-select-option>

                    <ion-select-option value="sg">
                      🇸🇬 Singapore
                    </ion-select-option>

                    <ion-select-option value="jp">
                      🇯🇵 Jepang
                    </ion-select-option>

                    <ion-select-option value="us">
                      🇺🇸 Amerika Serikat
                    </ion-select-option>

                    <ion-select-option value="au">
                      🇦🇺 Australia
                    </ion-select-option>
                  </ion-select>
                </ion-item>

                <ion-item>
                  <ion-label position="stacked">
                    Kota
                  </ion-label>

                  <ion-input
                    v-model="cityQuery"
                    placeholder="Contoh: Kendari"
                  />
                </ion-item>

                <ion-button
                  expand="block"
                  :disabled="
                    loadingPlaces ||
                    !cityQuery.trim()
                  "
                  @click="searchByCity"
                >
                  <ion-spinner
                    v-if="loadingPlaces"
                    name="crescent"
                  />

                  <span v-else>
                    🔎 Cari tempat
                  </span>
                </ion-button>
              </div>

              <ion-text
                v-if="locationError"
                color="danger"
              >
                <p>
                  {{ locationError }}
                </p>
              </ion-text>

            </ion-card-content>
          </ion-card>

          <div
  v-if="places.length > 0"
  class="places-section"
>
  <div class="section-header">
    <h2>Tempat ditemukan</h2>

    <span>
      {{ places.length }} tempat
    </span>
  </div>

  <ion-card
    v-for="place in places"
    :key="place.sourceId || place.id"
    class="place-card"
  >
    <ion-card-content>

      <h3>
        {{ place.name }}
      </h3>

      <p>
        📍
        {{ place.city || "Lokasi tidak diketahui" }}
        <span v-if="place.country">
          , {{ place.country }}
        </span>
      </p>

      <p class="address">
        {{ place.address }}
      </p>

      <p v-if="place.rating">
        ⭐ {{ place.rating }}
      </p>

    </ion-card-content>
  </ion-card>

</div>
<ion-text
  v-if="
    !loadingPlaces &&
    locationMode &&
    places.length === 0
  "
>
  <p class="empty-state">
    Belum ada tempat ditemukan.
  </p>
</ion-text>

        </section>


        <!-- ================================= -->
        <!-- RECOMMENDATION -->
        <!-- ================================= -->

        <section class="recommendation-section">

          <div class="section-header">

            <div>

              <h2>
                Rekomendasi untukmu
              </h2>

              <p class="section-description">
                Berdasarkan kategori yang kamu sukai
              </p>

            </div>

          </div>


          <!-- NO PREFERENCE -->

          <div
            v-if="preferences.length === 0"
            class="recommendation-card"
          >

            <div class="recommendation-icon">
              ✨
            </div>

            <div>

              <strong>
                Belum ada preferensi
              </strong>

              <p>
                Pilih kategori favoritmu di
                halaman profil untuk mendapatkan
                rekomendasi.
              </p>

            </div>

          </div>


          <!-- HAS PREFERENCE -->

          <div
            v-else
            class="recommendation-card"
          >

            <div class="recommendation-icon">
              ✨
            </div>

            <div>

              <strong>
                Kamu menyukai:
              </strong>

              <p>
                {{ preferences.join(", ") }}
              </p>

            </div>

          </div>

        </section>

      </div>

    </ion-content>


    <!-- ================================= -->
    <!-- BOTTOM NAVIGATION -->
    <!-- ================================= -->

    <ion-footer class="bottom-navigation">

      <ion-toolbar>

        <div class="bottom-nav-container">

          <!-- HOME -->

          <button
            class="nav-item active"
            type="button"
            @click="goToDashboard"
          >

            <ion-icon
              :icon="homeOutline"
            />

            <span>
              Home
            </span>

          </button>


          <!-- EXPLORE -->

          <button
            class="nav-item"
            type="button"
            @click="goToPlaces"
          >

            <ion-icon
              :icon="compassOutline"
            />

            <span>
              Explore
            </span>

          </button>


          <!-- FAVORITES -->

          <button
            class="nav-item"
            type="button"
            @click="goToFavorites"
          >

            <ion-icon
              :icon="heartOutline"
            />

            <span>
              Favorit
            </span>

          </button>


          <!-- HISTORY -->

          <button
            class="nav-item"
            type="button"
            @click="goToHistory"
          >

            <ion-icon
              :icon="timeOutline"
            />

            <span>
              Riwayat
            </span>

          </button>


          <!-- PROFILE -->

          <button
            class="nav-item"
            type="button"
            @click="goToProfile"
          >

            <ion-icon
              :icon="personOutline"
            />

            <span>
              Profil
            </span>

          </button>

        </div>

      </ion-toolbar>

    </ion-footer>

  </ion-page>
</template>


<script setup lang="ts">

import { getCurrentLocation } from "@/services/location.service";
import {
  syncPlaces,
  getGeoapifyCategory,
} from "@/services/place.service";

import type { Place } from "@/db/types";

import {
  ref,
  onMounted,
} from "vue";

import { onIonViewWillEnter } from "@ionic/vue";

import {
  useRouter,
} from "vue-router";


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
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonButton,
  IonSpinner,
  IonItem,
  IonSelect,
  IonSelectOption,
  IonInput,
  IonText,
} from "@ionic/vue";


import {
  homeOutline,
  compassOutline,
  heartOutline,
  timeOutline,
  personOutline,
  locationOutline,
  folderOpenOutline,
} from "ionicons/icons";


import {
  getUser,
  getAllCategories,
} from "../services/database.service";


import {
  getCurrentUserId,
} from "../services/auth.service";


import type {
  Category,
  User,
} from "../db/types";


/* =================================
   ROUTER
================================= */

const router = useRouter();


/* =================================
   USER
================================= */

const user = ref<User | null>(null);

const userName = ref("Pengguna");

const preferences = ref<string[]>([]);


/* =================================
   CATEGORIES
================================= */

const categories = ref<Category[]>([]);


/* =================================
   SEARCH
================================= */

const searchQuery = ref("");

/* =================================
   LOCATION
================================= */

const places = ref<Place[]>([]);

const locationMode = ref<"current" | "manual">(
  "current"
);

const selectedCountry = ref("id");

const cityQuery = ref("");

const selectedCategoryId = ref<number | undefined>(
  undefined
);

const loadingPlaces = ref(false);

const locationError = ref("");

/* =================================
   LOADING
================================= */

const loadingCategories = ref(true);

const loadingUser = ref(true);


/* =================================
   LOAD DASHBOARD DATA
================================= */

async function loadDashboard() {

  try {

    /* =============================
       GET CURRENT USER ID
    ============================= */

    const userId =
      getCurrentUserId();


    if (!userId) {

      await router.replace(
        "/login"
      );

      return;

    }


    /* =============================
       GET USER FROM INDEXEDDB
    ============================= */

    const currentUser =
      await getUser(userId);


    if (!currentUser) {

      await router.replace(
        "/login"
      );

      return;

    }


    user.value =
      currentUser;


    userName.value =
      currentUser.name;


    preferences.value =
      currentUser.preferences || [];


    loadingUser.value = false;


    /* =============================
       GET CATEGORIES
    ============================= */

    categories.value =
      await getAllCategories();


  } catch (error) {

    console.error(
      "Gagal memuat dashboard:",
      error
    );

  } finally {

    loadingCategories.value = false;

  }

}


/* =================================
   SEARCH
================================= */

function handleSearch(event: CustomEvent) {

  const value =
    event.detail.value || "";

  searchQuery.value =
    value;


  /*
   * Untuk sementara kita arahkan
   * pencarian ke halaman Places.
   *
   * Search sebenarnya akan kita
   * implementasikan penuh di
   * PlacesPage.
   */

  if (value.trim()) {

    router.push({
      path: "/places",
      query: {
        search: value.trim(),
      },
    });

  }

}


/* =================================
   CATEGORY
================================= */

// function selectCategory(
//   categoryId?: number
// ) {

//   if (!categoryId) {
//     return;
//   }


//   router.push({
//     path: "/places",
//     query: {
//       category: String(categoryId),
//     },
//   });

// }

async function searchNearby() {
  loadingPlaces.value = true;
  locationError.value = "";

  try {
    const location =
      await getCurrentLocation();

    const categoryId =
      selectedCategoryId.value;

    const category =
      getGeoapifyCategory(categoryId);

    places.value =
      await syncPlaces({
        latitude: location.latitude,
        longitude: location.longitude,

        radius: 5000,

        category,

        categoryId,

        limit: 30,
      });
  } catch (error) {
    console.error(
      "Gagal mencari tempat:",
      error
    );

    locationError.value =
      error instanceof Error
        ? error.message
        : "Gagal mendapatkan lokasi.";
  } finally {
    loadingPlaces.value = false;
  }
}

async function searchByCity() {
  if (!cityQuery.value.trim()) {
    locationError.value =
      "Masukkan nama kota terlebih dahulu.";

    return;
  }

  loadingPlaces.value = true;
  locationError.value = "";

  try {
    const categoryId =
      selectedCategoryId.value;

    const category =
      getGeoapifyCategory(categoryId);

    places.value =
      await syncPlaces({
        city: cityQuery.value.trim(),

        countryCode:
          selectedCountry.value,

        category,

        categoryId,

        limit: 30,
      });
  } catch (error) {
    console.error(
      "Gagal mencari kota:",
      error
    );

    locationError.value =
      error instanceof Error
        ? error.message
        : "Gagal mencari tempat.";
  } finally {
    loadingPlaces.value = false;
  }
}

function selectCategory(
  categoryId?: number
) {
  selectedCategoryId.value =
    categoryId;

  if (locationMode.value === "current") {
    searchNearby();
  } else if (cityQuery.value.trim()) {
    searchByCity();
  }
}


/* =================================
   NAVIGATION
================================= */

function goToDashboard() {

  router.push("/dashboard");

}


function goToPlaces() {

  router.push("/places");

}


function goToFavorites() {

  router.push("/favorites");

}


function goToHistory() {

  router.push("/history");

}


function goToProfile() {

  router.push("/profile");

}



/* =================================
   MOUNT
================================= */

onIonViewWillEnter(async () => {
  await loadDashboard();
});

</script>


<style scoped>

/* =================================
   GENERAL
================================= */

.dashboard-container {
  max-width: 700px;
  margin: 0 auto;
  padding: 20px 16px 32px;
}


/* =================================
   GREETING
================================= */

.greeting-section {
  margin-bottom: 20px;
}

.greeting-small {
  margin: 0 0 4px;
  color: var(--ion-color-medium);
  font-size: 14px;
}

.greeting-section h1 {
  margin: 0;
  font-size: 28px;
  font-weight: 700;
}

.greeting-description {
  margin: 8px 0 0;
  color: var(--ion-color-medium);
}


/* =================================
   SEARCH
================================= */

.search-section {
  margin-bottom: 28px;
}

ion-searchbar {
  --background: var(--ion-color-light);
  --box-shadow: none;
  --border-radius: 14px;
  padding: 0;
}


/* =================================
   SECTION HEADER
================================= */

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-bottom: 14px;
}

.section-header h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
}

.section-description {
  margin: 4px 0 0;
  color: var(--ion-color-medium);
  font-size: 13px;
}


/* =================================
   CATEGORY
================================= */

.category-section {
  margin-bottom: 32px;
}

.category-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.category-card {
  border: none;
  border-radius: 16px;
  padding: 18px 12px;
  background: var(--ion-color-light);
  color: var(--ion-text-color);
  text-align: center;
  cursor: pointer;
  transition: transform 0.15s ease;
}

.category-card:active {
  transform: scale(0.96);
}

.category-icon {
  font-size: 30px;
  margin-bottom: 8px;
}

.category-name {
  font-size: 14px;
  font-weight: 600;
}

.category-loading {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  padding: 30px 0;
}

.empty-state {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 30px;
  color: var(--ion-color-medium);
}

.empty-state ion-icon {
  font-size: 40px;
  margin-bottom: 8px;
}


/* =================================
   LOCATION
================================= */

.place-section {
  margin-bottom: 32px;
}

.location-card {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 14px;
  padding: 18px;
  border-radius: 16px;
  background: var(--ion-color-light);
}

.location-card ion-icon {
  flex-shrink: 0;
  font-size: 28px;
  color: var(--ion-color-primary);
}

.location-card strong {
  display: block;
  margin-bottom: 4px;
}

.location-card p {
  margin: 0;
  color: var(--ion-color-medium);
  font-size: 14px;
  line-height: 1.5;
}


/* =================================
   RECOMMENDATION
================================= */

.recommendation-section {
  margin-bottom: 24px;
}

.recommendation-card {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 18px;
  border-radius: 16px;
  background: var(--ion-color-light);
}

.recommendation-icon {
  font-size: 28px;
  flex-shrink: 0;
}

.recommendation-card strong {
  display: block;
  margin-bottom: 4px;
}

.recommendation-card p {
  margin: 0;
  color: var(--ion-color-medium);
  font-size: 14px;
  line-height: 1.5;
}


/* =================================
   BOTTOM NAVIGATION
================================= */

.bottom-navigation {
  border-top: 1px solid
    var(--ion-color-light-shade);
}

.bottom-navigation ion-toolbar {
  --padding-top: 6px;
  --padding-bottom: 6px;
  --min-height: 64px;
}

.bottom-nav-container {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  width: 100%;
}

.nav-item {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 3px;

  border: none;
  background: transparent;

  color: var(--ion-color-medium);

  font-size: 11px;
  cursor: pointer;
}

.nav-item ion-icon {
  font-size: 22px;
}

.nav-item.active {
  color: var(--ion-color-primary);
}

.nav-item:active {
  opacity: 0.7;
}


/* =================================
   DESKTOP
================================= */

@media (min-width: 768px) {

  .dashboard-container {
    padding-top: 32px;
  }

  .category-grid {
    grid-template-columns:
      repeat(4, 1fr);
  }

}

</style>

