import { openDB, type DBSchema, type IDBPDatabase } from "idb";

import type {
  User,
  Place,
  Category,
  Favorite,
  VisitHistory,
} from "./types";

interface LocalExploreDB extends DBSchema {
  users: {
    key: number;
    value: User;
    indexes: {
      "by-email": string;
    };
  };

  places: {
    key: number;
    value: Place;
    indexes: {
      "by-name": string;
      "by-category": number;
      "by-source": string;
      "by-source-id": string;
    };
  };

  categories: {
    key: number;
    value: Category;
    indexes: {
      "by-name": string;
    };
  };

  favorites: {
    key: number;
    value: Favorite;
    indexes: {
      "by-user": number;
      "by-place": number;
      "by-user-place": [number, number];
    };
  };

  visit_history: {
    key: number;
    value: VisitHistory;
    indexes: {
      "by-user": number;
      "by-place": number;
      "by-visited-at": string;
    };
  };
}

const DB_NAME = "local_explore_db";
const DB_VERSION = 2;

let dbInstance: IDBPDatabase<LocalExploreDB> | null = null;

export async function getDatabase(): Promise<
  IDBPDatabase<LocalExploreDB>
> {
  if (dbInstance) {
    return dbInstance;
  }

  dbInstance = await openDB<LocalExploreDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // =========================
      // USERS
      // =========================
      if (!db.objectStoreNames.contains("users")) {
        const userStore = db.createObjectStore("users", {
          keyPath: "id",
          autoIncrement: true,
        });

        userStore.createIndex("by-email", "email", {
          unique: true,
        });
      }

      // =========================
      // PLACES
      // =========================
      if (!db.objectStoreNames.contains("places")) {
        const placeStore = db.createObjectStore("places", {
          keyPath: "id",
          autoIncrement: true,
        });

        placeStore.createIndex("by-name", "name");
        placeStore.createIndex("by-category", "categoryId");
        placeStore.createIndex("by-source", "source");
        placeStore.createIndex(
        "by-source-id",
        "sourceId"
        );
      }

      // =========================
      // CATEGORIES
      // =========================
      if (!db.objectStoreNames.contains("categories")) {
        const categoryStore = db.createObjectStore("categories", {
          keyPath: "id",
          autoIncrement: true,
        });

        categoryStore.createIndex("by-name", "name", {
          unique: true,
        });
      }

      // =========================
      // FAVORITES
      // =========================
      if (!db.objectStoreNames.contains("favorites")) {
        const favoriteStore = db.createObjectStore("favorites", {
          keyPath: "id",
          autoIncrement: true,
        });

        favoriteStore.createIndex("by-user", "userId");
        favoriteStore.createIndex("by-place", "placeId");

        favoriteStore.createIndex(
          "by-user-place",
          ["userId", "placeId"],
          {
            unique: true,
          }
        );
      }

      // =========================
      // VISIT HISTORY
      // =========================
      if (!db.objectStoreNames.contains("visit_history")) {
        const historyStore = db.createObjectStore("visit_history", {
          keyPath: "id",
          autoIncrement: true,
        });

        historyStore.createIndex("by-user", "userId");
        historyStore.createIndex("by-place", "placeId");
        historyStore.createIndex("by-visited-at", "visitedAt");
      }
    },
  });

  return dbInstance;
}