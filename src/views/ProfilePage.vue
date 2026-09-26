<template>
  <ion-page>
    <!-- HEADER -->
    <ion-header class="ion-no-border">
      <ion-toolbar class="custom-toolbar">
        <ion-title class="custom-title">Profil Akun</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="custom-content">

      <!-- LOADING -->
      <div
        v-if="loading"
        class="state-container fade-in"
      >
        <div class="spinner-wrapper">
          <ion-spinner name="crescent" color="primary" />
        </div>
        <p>Memuat profil...</p>
      </div>

      <!-- ERROR -->
      <ion-text
        v-else-if="errorMessage"
        color="danger"
        class="fade-in ion-padding"
      >
        <div class="error-box">
          <span class="error-icon">⚠️</span>
          <div>
            <strong>Terjadi kesalahan</strong>
            <p>{{ errorMessage }}</p>
          </div>
        </div>
      </ion-text>

      <!-- PROFILE -->
      <div v-else-if="user" class="fade-in">

        <!-- DECORATIVE BACKGROUND -->
        <div class="hero-bg"></div>

        <div class="profile-container">
          <!-- PROFILE HEADER -->
          <div class="profile-header">
            <div class="avatar-wrapper">
              <div class="avatar">
                {{ getInitials(user.name) }}
              </div>
              <div class="avatar-ring"></div>
            </div>

            <h2 class="user-name">
              {{ user.name }}
            </h2>

            <p class="user-email">
              {{ user.email }}
            </p>

            <ion-button
              class="edit-btn"
              shape="round"
              fill="outline"
              size="small"
              @click="editMode = !editMode"
            >
              <span class="btn-icon">✏️</span> {{ editMode ? "Batal Edit" : "Edit Profil" }}
            </ion-button>
          </div>

          <!-- EDIT PROFILE FORM -->
          <div
            v-if="editMode"
            class="edit-profile modern-card fade-in"
          >
            <div class="card-title">Pengaturan Profil</div>
            
            <div class="input-group">
              <ion-item class="modern-input" lines="none">
                <ion-label position="stacked">Nama Lengkap</ion-label>
                <ion-input
                  v-model="editName"
                  placeholder="Masukkan nama kamu"
                />
              </ion-item>

              <ion-item class="modern-input" lines="none">
                <ion-label position="stacked">Alamat Email</ion-label>
                <ion-input
                  v-model="editEmail"
                  type="email"
                  placeholder="Masukkan email kamu"
                />
              </ion-item>
            </div>

            <div class="preference-editor">
              <h3>Kategori yang kamu sukai</h3>
              <div class="preferences-chips">
                <ion-chip
                  v-for="category in categories"
                  :key="category.id"
                  class="custom-chip"
                  :outline="!selectedPreferences.includes(category.name)"
                  :color="selectedPreferences.includes(category.name) ? 'primary' : 'medium'"
                  @click="togglePreference(category.name)"
                >
                  <span class="chip-icon">{{ category.icon }}</span>
                  {{ category.name }}
                </ion-chip>
              </div>
            </div>

            <ion-button
              class="save-btn"
              expand="block"
              shape="round"
              :disabled="saving"
              @click="saveProfile"
            >
              <ion-spinner
                v-if="saving"
                name="crescent"
              />
              <span v-else>
                💾 Simpan Perubahan
              </span>
            </ion-button>
          </div>

          <!-- STATISTICS (Floating Card) -->
          <div class="stats-container modern-card">
            <div class="stat-item">
              <div class="stat-icon red-bg">❤️</div>
              <div class="stat-data">
                <strong>{{ favoriteCount }}</strong>
                <span>Favorit</span>
              </div>
            </div>

            <div class="stat-divider"></div>

            <div class="stat-item">
              <div class="stat-icon blue-bg">🕒</div>
              <div class="stat-data">
                <strong>{{ historyCount }}</strong>
                <span>Riwayat</span>
              </div>
            </div>
          </div>

          <!-- PREFERENCES -->
          <ion-card class="modern-card">
            <ion-card-header class="no-pad-bottom">
              <ion-card-title class="card-title">🏷️ Preferensi Saya</ion-card-title>
            </ion-card-header>

            <ion-card-content>
              <div
                v-if="user.preferences.length"
                class="preferences-chips mt-2"
              >
                <ion-chip
                  v-for="preference in user.preferences"
                  :key="preference"
                  color="primary"
                  class="read-only-chip"
                >
                  {{ preference }}
                </ion-chip>
              </div>

              <div v-else class="empty-preferences">
                <span class="empty-icon">🤷‍♂️</span>
                <p>Belum ada preferensi kategori yang dipilih.</p>
              </div>
            </ion-card-content>
          </ion-card>

          <!-- ACCOUNT -->
          <ion-card class="modern-card">
            <ion-card-header class="no-pad-bottom">
              <ion-card-title class="card-title">🔐 Informasi Akun</ion-card-title>
            </ion-card-header>

            <ion-card-content>
              <div class="account-list">
                <div class="account-item">
                  <div class="acc-icon">👤</div>
                  <div class="acc-text">
                    <span>Nama</span>
                    <p>{{ user.name }}</p>
                  </div>
                </div>

                <div class="account-divider"></div>

                <div class="account-item">
                  <div class="acc-icon">📧</div>
                  <div class="acc-text">
                    <span>Email</span>
                    <p>{{ user.email }}</p>
                  </div>
                </div>
              </div>
            </ion-card-content>
          </ion-card>

          <ion-card class="about-card">
  <ion-card-header>
    <ion-card-title>Tentang Aplikasi</ion-card-title>
  </ion-card-header>

  <ion-card-content>
    <div class="about-app">
      <img
        src="@/assets/logo_aplikasi.jpeg"
        alt="Local Explore"
        class="about-logo"
      />

      <div class="about-info">
        <h3>Local Explore</h3>

        <p>
          Jelajahi tempat menarik di sekitarmu.
        </p>

        <span class="app-version">
          Versi 1.0.0
        </span>
      </div>
    </div>
  </ion-card-content>
</ion-card>

          <!-- LOGOUT -->
          <div class="logout-wrapper">
            <ion-button
              class="logout-btn"
              expand="block"
              color="danger"
              fill="solid"
              shape="round"
              @click="handleLogout"
            >
              <span class="btn-icon">🚪</span> Keluar Akun
            </ion-button>
          </div>

        </div>
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
  IonInput,
} from "@ionic/vue";

import BottomNavigation from "@/components/BottomNavigation.vue";

import type { User, Category } from "@/db/types";

import {
  getUser,
  getUserFavorites,
  getUserVisitHistory,
  updateUser,
  getAllCategories,
  getUserByEmail,
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

const editMode = ref(false);

const editName = ref("");
const editEmail = ref("");

const categories = ref<Category[]>([]);

const selectedPreferences = ref<string[]>([]);

const saving = ref(false);
const saveMessage = ref("");

async function loadCategories() {
  categories.value =
    await getAllCategories();
}

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
    editName.value = currentUser.name;
    editEmail.value = currentUser.email;
    selectedPreferences.value = [
      ...currentUser.preferences,
    ];

    await loadCategories();

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

async function saveProfile() {
  if (!user.value?.id) return;

  const name =
    editName.value.trim();

  const email =
    editEmail.value
      .trim()
      .toLowerCase();

  if (!name) {
    errorMessage.value =
      "Nama tidak boleh kosong.";
    return;
  }

  if (!email) {
    errorMessage.value =
      "Email tidak boleh kosong.";
    return;
  }

  saving.value = true;
  errorMessage.value = "";
  saveMessage.value = "";

  try {
    const existingUser =
      await getUserByEmail(email);

    if (
      existingUser &&
      existingUser.id !== user.value.id
    ) {
      throw new Error(
        "Email sudah digunakan oleh akun lain."
      );
    }

    const updatedUser: User = {
      ...user.value,
      name,
      email,
      preferences: [
        ...selectedPreferences.value,
      ],
    };

    await updateUser(updatedUser);

    user.value = updatedUser;

    editMode.value = false;

    saveMessage.value =
      "Profil berhasil diperbarui.";

  } catch (error) {

    console.error(
      "Gagal memperbarui profil:",
      error
    );

    errorMessage.value =
      error instanceof Error
        ? error.message
        : "Gagal memperbarui profil.";

  } finally {

    saving.value = false;

  }
}

function togglePreference(
  categoryName: string
) {
  if (
    selectedPreferences.value.includes(
      categoryName
    )
  ) {
    selectedPreferences.value =
      selectedPreferences.value.filter(
        (item) =>
          item !== categoryName
      );
  } else {
    selectedPreferences.value.push(
      categoryName
    );
  }
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
/* ====================
   GLOBAL STYLES 
   ==================== */
.custom-content {
  --background: #f8fafc;
}

.custom-toolbar {
  --background: #ffffff;
  --box-shadow: none;
}

.custom-title {
  font-weight: 700;
  font-size: 20px;
  color: #1e293b;
}

/* ====================
   HERO BACKGROUND & WRAPPER
   ==================== */
.hero-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 160px;
  background: linear-gradient(135deg, #4f46e5, #3b82f6);
  border-bottom-left-radius: 40px;
  border-bottom-right-radius: 40px;
  z-index: 0;
}

.profile-container {
  position: relative;
  z-index: 1;
  padding: 20px 16px 40px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* ====================
   PROFILE HEADER 
   ==================== */
.profile-header {
  text-align: center;
  margin-top: 20px;
  margin-bottom: 8px;
}

.avatar-wrapper {
  position: relative;
  width: 100px;
  height: 100px;
  margin: 0 auto 16px;
}

.avatar {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  color: #4f46e5;
  font-size: 36px;
  font-weight: 800;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  position: relative;
  z-index: 2;
  border: 4px solid #ffffff;
}

.avatar-ring {
  position: absolute;
  top: -6px;
  left: -6px;
  right: -6px;
  bottom: -6px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  z-index: 1;
}

.user-name {
  margin: 0 0 4px;
  font-size: 22px;
  font-weight: 800;
  color: #1e293b;
}

.user-email {
  margin: 0 0 16px;
  font-size: 14px;
  color: #64748b;
}

.edit-btn {
  --border-radius: 20px;
  --border-width: 2px;
  --color: #4f46e5;
  --border-color: #e0e7ff;
  font-weight: 600;
  margin: 0 auto;
}

/* ====================
   CARD DESIGN 
   ==================== */
.modern-card {
  margin: 0;
  border-radius: 20px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.04);
  background: white;
  padding: 16px;
}

.card-title {
  font-size: 16px;
  font-weight: 700;
  color: #0f172a;
}

.no-pad-bottom {
  padding-bottom: 4px;
  padding-top: 0;
  padding-left: 0;
  padding-right: 0;
}

/* ====================
   STATISTICS CARD 
   ==================== */
.stats-container {
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding: 20px 16px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
}

.red-bg { background: #ffe4e6; }
.blue-bg { background: #e0e7ff; }

.stat-data {
  display: flex;
  flex-direction: column;
}

.stat-data strong {
  font-size: 20px;
  color: #0f172a;
  line-height: 1.2;
}

.stat-data span {
  font-size: 12px;
  color: #64748b;
  font-weight: 500;
}

.stat-divider {
  width: 2px;
  height: 40px;
  background: #f1f5f9;
}

/* ====================
   EDIT PROFILE FORM 
   ==================== */
.edit-profile {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.modern-input {
  --background: #f8fafc;
  --padding-start: 16px;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  margin-top: 12px;
}

.preference-editor h3 {
  font-size: 14px;
  font-weight: 600;
  color: #475569;
  margin: 16px 0 12px;
}

.preferences-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.custom-chip {
  margin: 0;
  font-weight: 600;
  font-size: 13px;
  padding: 18px 14px;
}

.read-only-chip {
  margin: 0;
  font-weight: 600;
}

.save-btn {
  margin-top: 12px;
  font-weight: 700;
  --box-shadow: 0 8px 16px rgba(var(--ion-color-primary-rgb), 0.2);
}

.mt-2 {
  margin-top: 12px;
}

/* ====================
   ACCOUNT LIST 
   ==================== */
.account-list {
  display: flex;
  flex-direction: column;
  margin-top: 12px;
}

.account-item {
  display: flex;
  align-items: center;
  gap: 16px;
}

.acc-icon {
  font-size: 24px;
  width: 44px;
  height: 44px;
  background: #f1f5f9;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
}

.acc-text span {
  font-size: 12px;
  color: #64748b;
  display: block;
  margin-bottom: 2px;
}

.acc-text p {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  color: #0f172a;
}

.account-divider {
  height: 1px;
  background: #f1f5f9;
  margin: 16px 0;
}

/* ====================
   EMPTY PREFERENCES 
   ==================== */
.empty-preferences {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 16px 0;
  text-align: center;
}

.empty-icon {
  font-size: 32px;
  margin-bottom: 8px;
}

.empty-preferences p {
  margin: 0;
  color: #94a3b8;
  font-size: 13px;
}

/* ====================
   LOGOUT 
   ==================== */
.logout-wrapper {
  margin-top: 16px;
}

.logout-btn {
  font-weight: 700;
  --box-shadow: 0 8px 16px rgba(var(--ion-color-danger-rgb), 0.2);
}

/* ====================
   STATES (ERROR, LOAD) 
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
  display: flex;
  align-items: center;
  justify-content: center;
}

.state-container p {
  color: #64748b;
  font-size: 14px;
}

.error-box {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  background: #fef2f2;
  border: 1px solid #fecaca;
  padding: 16px;
  border-radius: 16px;
  color: #b91c1c;
  margin-top: 20px;
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
   ANIMATIONS
   ==================== */
.fade-in {
  animation: fadeIn 0.4s ease-in-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.about-card {
  margin-top: 16px;
}

.about-app {
  display: flex;
  align-items: center;
  gap: 16px;
}

.about-logo {
  width: 64px;
  height: 64px;
  object-fit: contain;
  border-radius: 14px;
}

.about-info {
  flex: 1;
}

.about-info h3 {
  margin: 0 0 4px;
  font-size: 18px;
  font-weight: 700;
  color: var(--ion-text-color);
}

.about-info p {
  margin: 0 0 8px;
  font-size: 14px;
  color: var(--ion-color-medium);
}

.app-version {
  display: inline-block;
  font-size: 13px;
  color: var(--ion-color-medium-shade);
}
</style>