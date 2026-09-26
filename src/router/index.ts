import { createRouter, createWebHistory } from "@ionic/vue-router";

import LoginPage from "../views/LoginPage.vue";
import RegisterPage from "../views/RegisterPage.vue";
import DashboardPage from "../views/DashboardPage.vue";
import PlacesPage from "../views/PlacesPage.vue";
import PlaceDetailPage from "../views/PlaceDetailPage.vue";
import PlaceFormPage from "../views/PlaceFormPage.vue";
import FavoritesPage from "../views/FavoritesPage.vue";
import HistoryPage from "../views/HistoryPage.vue";
import ProfilePage from "../views/ProfilePage.vue";
import MyPlacesPage from "../views/MyPlacesPage.vue";
import PrivacyPolicyPage from "@/views/PrivacyPolicyPage.vue";

import { isLoggedIn } from "@/services/auth.service.js";


const routes = [

  // =========================
  // AUTH
  // =========================

  {
    path: "/",
    redirect: "/login",
  },

  {
    path: "/login",
    name: "Login",
    component: LoginPage,
  },

  {
    path: "/register",
    name: "Register",
    component: RegisterPage,
  },

  {
    path: "/privacy-policy",
    name: "PrivacyPolicy",
    component: PrivacyPolicyPage,
  },


  // =========================
  // MAIN APP
  // =========================

  {
    path: "/dashboard",
    name: "Dashboard",
    component: DashboardPage,
    meta: {
      requiresAuth: true,
    },
  },


  // =========================
  // PLACES
  // =========================

  {
    path: "/places",
    name: "Places",
    component: PlacesPage,
    meta: {
      requiresAuth: true,
    },
  },

  {
    path: "/places/new",
    name: "PlaceForm",
    component: PlaceFormPage,
    meta: {
      requiresAuth: true,
    },
  },

  {
    path: "/places/:id/edit",
    name: "PlaceEdit",
    component: PlaceFormPage,
    meta: { requiresAuth: true },
  },

  {
    path: "/places/:id",
    name: "PlaceDetail",
    component: PlaceDetailPage,
    meta: {
      requiresAuth: true,
    },
  },

  {
    path: "/my-places",
    name: "MyPlaces",
    component: MyPlacesPage,
    meta: { requiresAuth: true },
  },


  // =========================
  // USER FEATURES
  // =========================

  {
    path: "/favorites",
    name: "Favorites",
    component: FavoritesPage,
    meta: {
      requiresAuth: true,
    },
  },

  {
    path: "/history",
    name: "History",
    component: HistoryPage,
    meta: {
      requiresAuth: true,
    },
  },

  {
    path: "/profile",
    name: "Profile",
    component: ProfilePage,
    meta: {
      requiresAuth: true,
    },
  },

];


const router = createRouter({

  history: createWebHistory(
    import.meta.env.BASE_URL
  ),

  routes,

});


/*
|--------------------------------------------------------------------------
| ROUTE GUARD
|--------------------------------------------------------------------------
*/

router.beforeEach((to) => {

  const loggedIn = isLoggedIn();


  // =========================
  // PROTECTED ROUTE
  // =========================

  if (
    to.meta.requiresAuth &&
    !loggedIn
  ) {

    return {
      name: "Login",
    };

  }


  // =========================
  // AUTH PAGE
  // =========================

  if (
    (to.name === "Login" ||
      to.name === "Register") &&
    loggedIn
  ) {

    return {
      name: "Dashboard",
    };

  }


  // =========================
  // ALLOW
  // =========================

  return true;

});


export default router;

