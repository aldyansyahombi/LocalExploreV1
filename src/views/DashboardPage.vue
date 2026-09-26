<template>
  <ion-page>

    <!-- ================================= -->
    <!-- HEADER -->
    <!-- ================================= -->

    <ion-header class="ion-no-border">
      <ion-toolbar class="custom-toolbar">
        <ion-title class="custom-title">
          Local Explore
        </ion-title>
      </ion-toolbar>
    </ion-header>


    <!-- ================================= -->
    <!-- CONTENT -->
    <!-- ================================= -->

    <ion-content class="custom-content">

      <div class="dashboard-container">

        <!-- ================================= -->
        <!-- GREETING & HERO BANNER -->
        <!-- ================================= -->

        <section class="hero-section fade-in">
          <div class="hero-card">
            <!-- Unsplash Image (Nature/Travel Theme - Bebas Hak Cipta) -->
            <img 
              src="@/assets/gambar1.jpeg" 
              alt="Explore Indonesia" 
              class="hero-image"
            />
            <div class="hero-overlay">
              <p class="greeting-small">
                Selamat datang 👋
              </p>
              <h1>
                Halo, {{ userName || 'Petualang' }}
              </h1>
              <p class="greeting-description">
                Mau eksplorasi ke mana hari ini?
              </p>
            </div>
          </div>
        </section>


        <!-- ================================= -->
        <!-- CATEGORIES -->
        <!-- ================================= -->

        <section class="category-section fade-in">

          <div class="section-header">
            <h2>Kategori</h2>
            <ion-button
              v-if="categories.length > 4"
              class="see-all-btn"
              fill="clear"
              size="small"
              @click="showAllCategories = !showAllCategories"
            >
              {{ showAllCategories ? "Tampilkan lebih sedikit" : "Lihat semua" }}
            </ion-button>
          </div>

          <!-- CATEGORY LOADING -->
          <div
            v-if="loadingCategories"
            class="category-loading state-box"
          >
            <ion-spinner name="crescent" color="primary" />
            <span>Memuat kategori...</span>
          </div>

          <!-- CATEGORY EMPTY -->
          <div
            v-else-if="categories.length === 0"
            class="empty-state state-box"
          >
            <ion-icon :icon="folderOpenOutline" class="empty-icon" />
            <p>Belum ada kategori.</p>
          </div>

          <!-- CATEGORY CARDS -->
          <div
            v-else
            class="category-grid"
          >
            <button
              v-for="category in displayedCategories"
              :key="category.id"
              class="category-card"
              type="button"
              @click="selectCategory(category.id)"
            >
              <div class="category-icon-wrapper">
                <span class="category-icon">{{ category.icon }}</span>
              </div>
              <span class="category-name">
                {{ category.name }}
              </span>
            </button>
          </div>

        </section>


        <!-- ================================= -->
        <!-- NEARBY PLACE & LOCATION -->
        <!-- ================================= -->

        <section class="place-section fade-in">

          <div class="section-header">
            <div>
              <h2>Di sekitar kamu</h2>
              <p class="section-description">
                Tempat menarik di dekat lokasimu
              </p>
            </div>
            <ion-button
              class="see-all-btn"
              fill="clear"
              size="small"
              @click="goToPlaces"
            >
              Lihat semua
            </ion-button>
          </div>


          <!-- LOCATION SETTINGS -->
          <ion-card class="modern-card location-card">
            <ion-card-header class="no-pad-bottom">
              <ion-card-title class="card-title">
                📍 Atur Lokasi Pencarian
              </ion-card-title>
            </ion-card-header>

            <ion-card-content>

              <ion-segment
                v-model="locationMode"
                class="custom-segment"
                mode="ios"
              >
                <ion-segment-button value="current">
                  <ion-label>Lokasi Saya</ion-label>
                </ion-segment-button>

                <ion-segment-button value="manual">
                  <ion-label>Pilih Kota</ion-label>
                </ion-segment-button>
              </ion-segment>

              <!-- GPS -->
              <div
                v-if="locationMode === 'current'"
                class="location-action mt-3"
              >
                <p class="action-desc">
                  Temukan tempat menarik di sekitar posisi kamu.
                </p>

                <ion-button
                  class="action-btn"
                  expand="block"
                  shape="round"
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
                class="location-action mt-3"
              >
                <ion-item class="modern-input" lines="none">
                  <ion-label position="stacked">Negara</ion-label>
                  <ion-select
                    v-model="selectedCountry"
                    interface="popover"
                  >
                    <ion-select-option value="id">🇮🇩 Indonesia</ion-select-option>
                    <ion-select-option value="my">🇲🇾 Malaysia</ion-select-option>
                    <ion-select-option value="sg">🇸🇬 Singapore</ion-select-option>
                    <ion-select-option value="jp">🇯🇵 Jepang</ion-select-option>
                    <ion-select-option value="us">🇺🇸 Amerika Serikat</ion-select-option>
                    <ion-select-option value="au">🇦🇺 Australia</ion-select-option>
                  </ion-select>
                </ion-item>

                <ion-item class="modern-input" lines="none">
                  <ion-label position="stacked">Kota</ion-label>
                  <ion-input
                    v-model="cityQuery"
                    placeholder="Contoh: Kendari"
                  />
                </ion-item>

                <ion-button
                  class="action-btn"
                  expand="block"
                  shape="round"
                  :disabled="loadingPlaces || !cityQuery.trim()"
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

              <!-- ERROR LOCATION -->
              <ion-text
                v-if="locationError"
                color="danger"
              >
                <div class="error-msg">
                  ⚠️ {{ locationError }}
                </div>
              </ion-text>

            </ion-card-content>
          </ion-card>

          <!-- RESULTS CARDS (HORIZONTAL SCROLL) -->
          <div
            v-if="places.length > 0"
            class="places-section mt-4"
          >
            <div class="section-header">
              <h2>Hasil Pencarian</h2>
              <span class="badge-count">{{ places.length }} tempat</span>
            </div>

            <div class="horizontal-scroll">
              <ion-card
                v-for="place in places"
                :key="place.sourceId || place.id"
                class="modern-place-card"
              >
                <ion-card-content>
                  <div class="place-icon-header">📍</div>
                  <h3 class="place-title">{{ place.name }}</h3>
                  
                  <p class="place-loc">
                    {{ place.city || "Lokasi tidak diketahui" }}
                    <span v-if="place.country">, {{ place.country }}</span>
                  </p>

                  <p class="place-address">
                    {{ place.address }}
                  </p>

                  <div v-if="place.rating" class="place-rating">
                    ⭐ {{ place.rating }}
                  </div>
                </ion-card-content>
              </ion-card>
            </div>
          </div>

          <!-- NO RESULTS -->
          <ion-text
            v-if="!loadingPlaces && locationMode && places.length === 0"
          >
            <div class="empty-state state-box mt-3">
              <span class="empty-emoji">🏜️</span>
              <p>Belum ada tempat ditemukan di area ini.</p>
            </div>
          </ion-text>

        </section>


        <!-- ================================= -->
        <!-- RECOMMENDATION -->
        <!-- ================================= -->

        <section class="recommendation-section fade-in">

          <div class="section-header">
            <div>
              <h2>Rekomendasi untukmu</h2>
              <p class="section-description">
                Berdasarkan kategori yang kamu sukai
              </p>
            </div>
          </div>

          <!-- NO PREFERENCE -->
          <div
            v-if="preferences.length === 0"
            class="recommendation-card modern-card"
          >
            <div class="recommendation-icon">✨</div>
            <div class="recommendation-content">
              <strong>Belum ada preferensi</strong>
              <p>
                Pilih kategori favoritmu di halaman profil untuk mendapatkan rekomendasi.
              </p>
            </div>
          </div>

          <!-- HAS PREFERENCE -->
          <div
            v-else
            class="recommendation-card modern-card active-recom"
          >
            <div class="recommendation-icon star-icon">✨</div>
            <div class="recommendation-content">
              <strong>Kamu menyukai:</strong>
              <p class="pref-list">
                {{ preferences.join(", ") }}
              </p>
            </div>
          </div>

        </section>

      </div>

    </ion-content>
      <BottomNavigation />

  </ion-page>
</template>


<script setup lang="ts">

import { getCurrentLocation } from "@/services/location.service";
import {
  syncPlaces,
  getGeoapifyCategory,
} from "@/services/place.service";

import type { Place } from "@/db/types";
import BottomNavigation from "@/components/BottomNavigation.vue";

import {
  ref,
  onMounted,
  computed,
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



const showAllCategories = ref(false);
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

const displayedCategories = computed(() => {
  if (showAllCategories.value) {
    return categories.value;
  }

  return categories.value.slice(0, 4);
});


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
/* ====================
   GLOBAL & HEADER 
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
  font-size: 20px;
  color: #1e293b;
}

.dashboard-container {
  padding: 16px 16px 30px;
  display: flex;
  flex-direction: column;
  gap: 28px;
}

/* ====================
   HERO / GREETING 
   ==================== */
.hero-card {
  position: relative;
  width: 100%;
  height: 180px;
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
}

.hero-image {
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
  background: linear-gradient(to right, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.3) 100%);
  padding: 24px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.greeting-small {
  color: #fbbf24;
  margin: 0 0 4px;
  font-size: 13px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.hero-overlay h1 {
  color: #ffffff;
  margin: 0 0 8px;
  font-size: 24px;
  font-weight: 800;
}

.greeting-description {
  color: #f1f5f9;
  margin: 0;
  font-size: 14px;
}

/* ====================
   SECTION HEADERS 
   ==================== */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 16px;
}

.section-header h2 {
  font-size: 18px;
  font-weight: 800;
  color: #1e293b;
  margin: 0 0 4px;
}

.section-description {
  font-size: 13px;
  color: #64748b;
  margin: 0;
}

.see-all-btn {
  --color: #4f46e5;
  font-weight: 600;
  font-size: 13px;
  margin: 0;
  --padding-end: 0;
}

/* ====================
   CATEGORIES GRID
   ==================== */
.category-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

.category-card {
  background: transparent;
  border: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 0;
}

.category-icon-wrapper {
  width: 60px;
  height: 60px;
  background: white;
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0,0,0,0.04);
  transition: transform 0.2s;
}

.category-card:active .category-icon-wrapper {
  transform: scale(0.95);
  background: #f1f5f9;
}

.category-icon {
  font-size: 28px;
}

.category-name {
  font-size: 12px;
  font-weight: 600;
  color: #475569;
  text-align: center;
}

/* ====================
   LOCATION & PLACES
   ==================== */
.modern-card {
  margin: 0;
  border-radius: 20px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.04);
  background: white;
}

.card-title {
  font-size: 16px;
  font-weight: 700;
  color: #0f172a;
}

.no-pad-bottom {
  padding-bottom: 0;
}

.custom-segment {
  background: #f1f5f9;
  border-radius: 12px;
  padding: 4px;
  margin-top: 10px;
}

.modern-input {
  --background: #f8fafc;
  --border-radius: 12px;
  margin-bottom: 12px;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
}

.action-desc {
  font-size: 13px;
  color: #64748b;
  margin-bottom: 12px;
}

.action-btn {
  --border-radius: 14px;
  font-weight: 600;
  margin: 0;
}

.error-msg {
  background: #fef2f2;
  color: #b91c1c;
  padding: 10px;
  border-radius: 10px;
  font-size: 12px;
  margin-top: 12px;
}

/* ====================
   HORIZONTAL SCROLL PLACES
   ==================== */
.horizontal-scroll {
  display: flex;
  overflow-x: auto;
  gap: 16px;
  padding-bottom: 12px;
  scroll-snap-type: x mandatory;
}

.horizontal-scroll::-webkit-scrollbar {
  display: none; /* Hide scrollbar for clean look */
}

.modern-place-card {
  min-width: 240px;
  margin: 0;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  scroll-snap-align: start;
  background: white;
}

.place-icon-header {
  font-size: 24px;
  margin-bottom: 8px;
}

.place-title {
  margin: 0 0 4px;
  font-size: 15px;
  font-weight: 700;
  color: #0f172a;
}

.place-loc {
  margin: 0 0 6px;
  font-size: 12px;
  color: #4f46e5;
  font-weight: 600;
}

.place-address {
  margin: 0 0 10px;
  font-size: 12px;
  color: #64748b;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.place-rating {
  background: #fef08a;
  color: #854d0e;
  display: inline-block;
  padding: 4px 8px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 700;
}

/* ====================
   RECOMMENDATIONS
   ==================== */
.recommendation-card {
  display: flex;
  gap: 16px;
  padding: 16px;
  align-items: flex-start;
}

.active-recom {
  background: linear-gradient(135deg, #4f46e5, #3b82f6);
  color: white;
}

.active-recom strong, .active-recom p {
  color: white;
}

.recommendation-icon {
  font-size: 28px;
  background: #f1f5f9;
  padding: 12px;
  border-radius: 16px;
}

.star-icon {
  background: rgba(255, 255, 255, 0.2);
}

.recommendation-content strong {
  display: block;
  font-size: 15px;
  color: #0f172a;
  margin-bottom: 4px;
}

.recommendation-content p {
  margin: 0;
  font-size: 13px;
  color: #64748b;
  line-height: 1.4;
}

.pref-list {
  font-weight: 600;
  text-transform: capitalize;
}



.nav-toolbar {
  --background: transparent;
  padding: 4px 0;
}

.bottom-nav-container {
  display: flex;
  justify-content: space-around;
  align-items: center;
  width: 100%;
}

.nav-item {
  background: transparent;
  border: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 8px 12px;
  color: #94a3b8;
  transition: all 0.3s ease;
}

.nav-icon {
  font-size: 24px;
}

.nav-item span {
  font-size: 11px;
  font-weight: 600;
}

.nav-item.active {
  color: #4f46e5;
}

.nav-item.active .nav-icon {
  transform: translateY(-2px);
}

/* ====================
   UTILITIES
   ==================== */
.state-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 30px 0;
  text-align: center;
}

.state-box span, .state-box p {
  margin-top: 12px;
  font-size: 13px;
  color: #64748b;
}

.empty-icon {
  font-size: 40px;
  color: #cbd5e1;
}

.empty-emoji {
  font-size: 40px;
}

.badge-count {
  background: #e2e8f0;
  color: #475569;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.mt-3 { margin-top: 16px; }
.mt-4 { margin-top: 24px; }

/* ANIMATION */
.fade-in {
  animation: fadeIn 0.4s ease-in-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>

