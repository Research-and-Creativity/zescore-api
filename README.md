# 🔌 ZeScore Backend API - Core Engine for PT3 Expo Evaluation

[![Zetech Sub-Product](https://img.shields.io/badge/Zetech-Ecosystem-blue?style=for-the-badge)](https://zetech.id)
[![Node Version](https://img.shields.io/badge/Node.js-LTS-339933?style=for-the-badge&logo=nodedotjs)](https://nodejs.org)
[![Express](https://img.shields.io/badge/Express.js-Framework-000000?style=for-the-badge&logo=express)](https://expressjs.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-Secure-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org)
[![Prisma](https://img.shields.io/badge/Prisma-7.8.0-2D3748?style=for-the-badge&logo=prisma)](https://prisma.io)

**ZeScore Backend API** adalah layanan sisi server (_backend_) utama yang menangani seluruh logika bisnis, otentikasi keamanan, validasi hak suara juri/audiens, serta kalkulasi data agregat untuk sistem penilaian Proyek Tingkat 3 (PT3) International Seminar & Expo. Built-in dengan penguncian hak suara ketat (Opsi A: 1 Mahasiswa = 1 Suara Global).

---

## 🛠️ Tech Stack & Library

- **Runtime & Framework:** Node.js + Express.js dengan TypeScript (`tsx` untuk development watch mode)
- **Database & ORM:** PostgreSQL / MySQL + Prisma ORM (v7.8.0)
- **Security & Auth:** JSON Web Token (JWT) & BcryptJS (Enkripsi Password)
- **CORS Handling:** Express CORS middleware

---

## ⚙️ Fitur API & Pembagian Kontribusi (Git Collaboration)

Repositori ini dikerjakan bersama dengan pembagian fitur terisolasi untuk menghindari _code conflict_:

### 💻 Modul Kiosk & Validasi (Dikerjakan oleh Dev 1)

- **Validasi Identitas:** Verifikasi NIM/NIDN secara _real-time_ ke data master.
- **Aturan Suara Ketat (Opsi A):** Memblokir hak akses _voter_ mahasiswa jika NIM yang bersangkutan sudah terekam memberikan suara di stan mana pun di database.
- **Pencatatan Penilaian:** Menyimpan data _vote_ tunggal (mahasiswa) atau multi-kategori (skor 1-100 dari dosen) ke dalam tabel `Assessment`.

### 👑 Modul Admin, Auth, & Analytics (Dikerjakan oleh Dev 2)

- **Otentikasi Akun (JWT):** Menangani _session login_ aman menggunakan token untuk Admin dan Tim Participant.
- **Agregasi Data Grafik:** Menggunakan query agregat Prisma (`groupBy`, `_count`, `_avg`) untuk menyuplai data statistik _real-time_ ke komponen chart Horizon UI di frontend.
- **Database Seeder:** Menyediakan skrip otomatisasi pengisian data master mahasiswa, juri, dan tim tiruan untuk keperluan _testing simulation_.

---

## 📁 Struktur Folder Backend

```text
src/
├── config/
│   └── database.ts       # Inisialisasi & Export Prisma Client
├── controllers/          # Logika Pengolahan Request & Response (Fungsi API)
│   ├── auth.controller.ts
│   ├── kiosk.controller.ts
│   └── admin.controller.ts
├── generated/            # Custom Output Directory untuk Prisma Client (v7.8.0)
│   └── prisma/
├── middlewares/          # Interceptor (JWT Validator, Error Handler)
├── routes/               # Handler Endpoint URI API Router
│   ├── auth.routes.ts
│   ├── kiosk.routes.ts
│   └── admin.routes.ts
└── index.ts              # Entry Point Utama Aplikasi Express
```

---

## 🚀 Panduan Instalasi & Menjalankan Proyek

### Prasyarat

Pastikan perangkat kamu sudah terinstal:

- [Node.js](https://nodejs.org) v18 atau lebih baru
- [Git](https://git-scm.com)
- [PostgreSQL](https://www.postgresql.org) atau MySQL (aktif dan berjalan)

### Langkah-langkah

**1. Clone repository**

```bash
git clone https://github.com/zetech/zescore-api.git
cd zescore-api
```

**2. Install dependensi**

```bash
npm install
```

**3. Buat file `.env`**

Buat file `.env` di root folder, lalu isi dengan:

```env
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/zescore_db"
JWT_SECRET="your_super_secret_key_here"
PORT=3000
```

> 🔧 Sesuaikan `USER`, `PASSWORD`, dan nama database dengan konfigurasi PostgreSQL kamu.

**4. Jalankan migrasi database**

```bash
npx prisma migrate dev --name init
```

**5. Generate Prisma Client**

```bash
npx prisma generate
```

**6. (Opsional) Jalankan database seeder**

```bash
npx prisma db seed
```

**7. Jalankan server**

```bash
# Mode development (hot-reload)
npm run dev
```

> ✅ Backend berjalan di `http://localhost:3000`

**8. Build untuk production** _(opsional)_

```bash
npm run build
npm run start
```

---

## 📡 Base URL API

| Environment | URL                                 |
| ----------- | ----------------------------------- |
| Development | `http://localhost:3000/api`         |
| Production  | `https://api.zescore.zetech.id/api` |

---

## ⚠️ Catatan Penting

- File `.env` **tidak boleh** di-_commit_ ke repository. Pastikan sudah terdaftar di `.gitignore`.
- Jalankan `npx prisma generate` ulang setiap kali ada perubahan pada `schema.prisma`.
- Pastikan backend berjalan **sebelum** menjalankan frontend.
