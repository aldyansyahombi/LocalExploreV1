# Local Explore

Aplikasi pencarian dan eksplorasi tempat lokal berbasis Ionic + Vue 3 dengan pengalaman mobile-first. Aplikasi ini memungkinkan pengguna untuk mendaftar/login, mencari tempat, menyimpan favorit, melihat riwayat kunjungan, dan mengelola tempat favorit secara lokal di perangkat.

## Fitur utama

- Autentikasi pengguna lokal
- Dashboard eksplorasi tempat
- Daftar tempat dengan detail lengkap
- Tambah, edit, dan hapus tempat
- Favorit tempat
- Riwayat kunjungan
- Mode offline dengan data lokal
- Integrasi peta menggunakan Leaflet
- Integrasi API Geoapify untuk data lokasi
- Packaging Android menggunakan Capacitor

## Tech stack

- Vue 3
- Ionic Vue
- TypeScript
- Vite
- IndexedDB (idb)
- Leaflet
- Capacitor
- Cypress + Vitest

## Prasyarat

Pastikan perangkat Anda sudah memiliki:

- Node.js 18+
- npm atau pnpm
- Android Studio (jika ingin build Android)

## Instalasi

1. Clone repositori ini.
2. Masuk ke folder proyek.
3. Install dependency:

```bash
npm install
```

## Konfigurasi environment

Buat file `.env` di root project berdasarkan `example.env`:

```bash
cp example.env .env
```

Lalu isi nilai API key Geoapify:

```env
VITE_GEOAPIFY_API_KEY=MASUKKAN_API_KEY_ANDA
```

> Anda bisa mendapatkan API key dari Geoapify.

## Menjalankan aplikasi di development

```bash
npm run dev
```

Aplikasi akan berjalan dengan Vite pada port default development server.

## Build production

```bash
npm run build
```

## Testing

### Unit test

```bash
npm run test:unit
```

### E2E test

```bash
npm run test:e2e
```

### Lint

```bash
npm run lint
```

## Android / Capacitor

Install platform Android jika belum ada:

```bash
npx cap add android
```

Sinkronkan web build ke Android:

```bash
npm run build
npx cap sync android
```

Buka project Android di Android Studio:

```bash
npx cap open android
```

## Struktur proyek

```bash
.
├── android/
├── public/
├── src/
├── tests/
├── capacitor.config.ts
├── example.env
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## Catatan penting

- Data aplikasi utama disimpan secara lokal di IndexedDB, sehingga fitur seperti daftar tempat, favorit, dan riwayat proses berjalan tanpa server backend.
- Aplikasi memerlukan API key Geoapify untuk fitur lokasi/pencarian.
- Untuk pengalaman terbaik, jalankan aplikasi pada browser atau emulator Android yang sudah terhubung dengan akses internet.

## Lisensi

Proyek ini dibuat untuk kebutuhan lokal dan belum mencantumkan lisensi resmi.
