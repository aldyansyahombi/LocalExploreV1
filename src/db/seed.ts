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
    icon: "🖼️",
    description: "Museum, galeri, dan tempat bersejarah",
  },
  {
    id: 6,
    name: "Hiburan",
    icon: "🎭",
    description: "Tempat hiburan dan rekreasi",
  },
  {
    id: 7,
    name: "Belanja",
    icon: "🛍️",
    description: "Toko, pasar, dan pusat perbelanjaan",
  },
  {
    id: 8,
    name: "Penginapan",
    icon: "🏨",
    description: "Hotel, hostel, dan tempat menginap",
  },
  {
    id: 9,
    name: "Pendidikan",
    icon: "🎓",
    description: "Sekolah, kampus, dan fasilitas pendidikan",
  },
  {
    id: 10,
    name: "Kesehatan",
    icon: "🏥",
    description: "Rumah sakit, klinik, dan fasilitas kesehatan",
  },
  {
    id: 11,
    name: "Pantai",
    icon: "🏖️",
    description: "Pantai dan kawasan pesisir",
  },
  {
    id: 12,
    name: "Olahraga",
    icon: "⚽",
    description: "Tempat dan fasilitas olahraga",
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