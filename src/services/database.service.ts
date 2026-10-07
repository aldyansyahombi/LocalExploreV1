import { getDatabase } from "../db/database";
import { hashPassword } from "../services/password.service";

import type {
  User,
  Place,
  Category,
  Favorite,
  VisitHistory,
} from "../db/types";

// =====================================================
// USERS
// =====================================================

export async function createUser(user: User): Promise<number> {
    console.log("USER YANG AKAN DISIMPAN:", user);
    console.log(
    "IS ARRAY:",
    Array.isArray(user.preferences)
    );
    console.log(
    "PREFERENCES:",
    user.preferences
    );
  const db = await getDatabase();
   const userData: User = {
    name: user.name,
    email: user.email,
    password: user.password,
    preferences: [...user.preferences],
    createdAt: user.createdAt,
  };

  return db.add("users", userData);
}

export async function getUser(id: number): Promise<User | undefined> {
  const db = await getDatabase();

  return db.get("users", id);
}

export async function getUserByEmail(
  email: string
): Promise<User | undefined> {
  const db = await getDatabase();

  return db.getFromIndex("users", "by-email", email);
}

export async function getAllUsers(): Promise<User[]> {
  const db = await getDatabase();

  return db.getAll("users");
}

export async function updateUser(user: User): Promise<number> {
  if (!user.id) {
    throw new Error("User ID is required");
  }

  const db = await getDatabase();

  return db.put("users", user);
}

export async function deleteUser(id: number): Promise<void> {
  const db = await getDatabase();

  await db.delete("users", id);
}

export async function deleteUserAccount(
  userId: number
): Promise<void> {
  const db = await getDatabase();

  // Hapus favorit milik user
  const favorites = await db.getAllFromIndex(
    "favorites",
    "by-user",
    userId
  );

  for (const favorite of favorites) {
    if (favorite.id !== undefined) {
      await db.delete("favorites", favorite.id);
    }
  }

  // Hapus riwayat milik user
  const histories = await db.getAllFromIndex(
    "visit_history",
    "by-user",
    userId
  );

  for (const history of histories) {
    if (history.id !== undefined) {
      await db.delete("visit_history", history.id);
    }
  }

  // Hapus akun
  await db.delete("users", userId);

  console.log("Akun berhasil dihapus:", userId);
}

// =====================================================
// REVIEWER ACCOUNT
// =====================================================

export async function seedReviewerAccount(): Promise<void> {
  const reviewerEmail = "reviewer@localexplore.app";
  const reviewerPassword = "ReviewLocal2026!";

  const existingUser = await getUserByEmail(reviewerEmail);

  if (existingUser) {
    return;
  }

  const hashedPassword = await hashPassword(reviewerPassword);

  await createUser({
    name: "Google Play Reviewer",
    email: reviewerEmail,
    password: hashedPassword,
    preferences: [],
    createdAt: new Date().toISOString(),
  });

  console.log("Reviewer account berhasil dibuat.");
}

// =====================================================
// PLACES
// =====================================================

export async function createPlace(place: Place): Promise<number> {
  const db = await getDatabase();

  return db.add("places", place);
}

export async function getPlace(
  id: number
): Promise<Place | undefined> {
  const db = await getDatabase();

  return db.get("places", id);
}

export async function getAllPlaces(): Promise<Place[]> {
  const db = await getDatabase();

  return db.getAll("places");
}

export async function getPlacesByCategory(
  categoryId: number
): Promise<Place[]> {
  const db = await getDatabase();

  return db.getAllFromIndex(
    "places",
    "by-category",
    categoryId
  );
}

export async function searchPlaces(
  keyword: string
): Promise<Place[]> {
  const db = await getDatabase();

  const places = await db.getAll("places");

  const search = keyword.toLowerCase().trim();

  return places.filter((place) =>
    place.name.toLowerCase().includes(search)
  );
}

export async function updatePlace(place: Place): Promise<number> {
  if (!place.id) {
    throw new Error("Place ID is required");
  }

  const db = await getDatabase();

  return db.put("places", place);
}

export async function deletePlace(id: number): Promise<void> {
  const db = await getDatabase();

  await db.delete("places", id);
}

export async function getPlaceBySourceId(
  sourceId: string
): Promise<Place | undefined> {
  const db = await getDatabase();

  return db.getFromIndex(
    "places",
    "by-source-id",
    sourceId
  );
}


// =====================================================
// CATEGORIES
// =====================================================

export async function createCategory(
  category: Category
): Promise<number> {
  const db = await getDatabase();

  return db.add("categories", category);
}

export async function getCategory(
  id: number
): Promise<Category | undefined> {
  const db = await getDatabase();

  return db.get("categories", id);
}

export async function getAllCategories(): Promise<Category[]> {
  const db = await getDatabase();

  return db.getAll("categories");
}

export async function updateCategory(
  category: Category
): Promise<number> {
  if (!category.id) {
    throw new Error("Category ID is required");
  }

  const db = await getDatabase();

  return db.put("categories", category);
}

export async function deleteCategory(id: number): Promise<void> {
  const db = await getDatabase();

  await db.delete("categories", id);
}

// =====================================================
// FAVORITES
// =====================================================

export async function addFavorite(
  favorite: Favorite
): Promise<number> {
  const db = await getDatabase();

  return db.add("favorites", favorite);
}

export async function getFavorite(
  id: number
): Promise<Favorite | undefined> {
  const db = await getDatabase();

  return db.get("favorites", id);
}

export async function getUserFavorites(
  userId: number
): Promise<Favorite[]> {
  const db = await getDatabase();

  return db.getAllFromIndex(
    "favorites",
    "by-user",
    userId
  );
}

export async function isFavorite(
  userId: number,
  placeId: number
): Promise<boolean> {
  const db = await getDatabase();

  const favorite = await db.getFromIndex(
    "favorites",
    "by-user-place",
    [userId, placeId]
  );

  return favorite !== undefined;
}

export async function removeFavorite(
  userId: number,
  placeId: number
): Promise<void> {
  const db = await getDatabase();

  const favorite = await db.getFromIndex(
    "favorites",
    "by-user-place",
    [userId, placeId]
  );

  if (favorite?.id !== undefined) {
    await db.delete("favorites", favorite.id);
  }
}

// =====================================================
// VISIT HISTORY
// =====================================================

export async function addVisitHistory(
  history: VisitHistory
): Promise<number> {
  const db = await getDatabase();

  const existingHistory = await db.getAllFromIndex(
    "visit_history",
    "by-user",
    history.userId
  );

  const existing = existingHistory.find(
    (item) => item.placeId === history.placeId
  );

  if (existing?.id) {
    return existing.id;
  }

  return db.add("visit_history", history);
}

export async function getVisitHistory(
  id: number
): Promise<VisitHistory | undefined> {
  const db = await getDatabase();

  return db.get("visit_history", id);
}

export async function getUserVisitHistory(
  userId: number
): Promise<VisitHistory[]> {
  const db = await getDatabase();

  const history =
    await db.getAllFromIndex(
      "visit_history",
      "by-user",
      userId
    );

  return history.sort(
    (a: VisitHistory, b: VisitHistory) =>
      new Date(b.visitedAt).getTime() -
      new Date(a.visitedAt).getTime()
  );
}

export async function deleteVisitHistory(
  id: number
): Promise<void> {
  const db = await getDatabase();

  await db.delete("visit_history", id);
}

export async function saveGeoapifyPlaces(
  places: Omit<Place, "id">[]
): Promise<number[]> {
  const db = await getDatabase();

  const tx = db.transaction(
    "places",
    "readwrite"
  );

  const ids: number[] = [];

  for (const place of places) {
    const existing = place.sourceId
      ? await tx.store.index("by-source-id").get(
          place.sourceId
        )
      : undefined;

    if (existing) {
      if (existing.id !== undefined) {
        await tx.store.put({
          ...place,
          id: existing.id,
          createdAt: existing.createdAt,
          updatedAt: new Date().toISOString(),
        });

        ids.push(existing.id);
      }
    } else {
      const id = await tx.store.add(place);
      ids.push(id);
    }
  }

  await tx.done;

  return ids;
}