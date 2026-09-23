import { getDatabase } from "./database";
import type { Category } from "./types";

const defaultCategories: Category[] = [
  {
    id: 1,
    name: "Wisata",
    icon: "🏝️",
    description: "Tempat wisata dan objek menarik",
  },
  {
    id: 2,
    name: "Taman",
    icon: "🌳",
    description: "Taman dan ruang terbuka hijau",
  },
  {
    id: 3,
    name: "Kuliner",
    icon: "🍜",
    description: "Restoran, kafe, dan tempat makan",
  },
  {
    id: 4,
    name: "Tempat Publik",
    icon: "🏛️",
    description: "Tempat umum dan fasilitas publik",
  },
  {
    id: 5,
    name: "Museum",
    icon: "🏛️",
    description: "Museum dan tempat bersejarah",
  },
];

export async function seedCategories() {
  const db = await getDatabase();

  const count = await db.count("categories");

  if (count > 0) {
    return;
  }

  const tx = db.transaction(
    "categories",
    "readwrite"
  );

  for (const category of defaultCategories) {
    await tx.store.put(category);
  }

  await tx.done;

  console.log("Default categories berhasil dibuat.");
}