<script setup lang="ts">
import { onMounted } from "vue";
import { IonApp, IonRouterOutlet } from "@ionic/vue";

import { getDatabase } from "./db/database";
import { seedCategories } from "./db/seed";
import { seedReviewerAccount } from "./services/database.service";

onMounted(async () => {
  try {
    const db = await getDatabase();

    await seedCategories();
    await seedReviewerAccount();

    console.log(
      "Database berhasil dibuka:",
      db.name
    );

    console.log(
      "Object stores:",
      Array.from(db.objectStoreNames)
    );
  } catch (error) {
    console.error(
      "Database initialization error:",
      error
    );
  }
});
</script>

<template>
  <ion-app>
    <ion-router-outlet />
  </ion-app>
</template>