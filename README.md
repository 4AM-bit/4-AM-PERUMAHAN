# PERUMAHAN — Digital Real Estate & Property Reservation Platform

Platform digital developer properti modern yang berfungsi sebagai website pemasaran hunian sekaligus sistem manajemen reservasi unit dengan penguncian anti double-booking, pembayaran manual transfer bank terverifikasi, notifikasi, pelaporan CSV, dan dashboard administrasi berbasis RBAC.

- **Production URL:** https://4-am-perumahan.vercel.app
- **Repository:** https://github.com/4AM-bit/4-AM-PERUMAHAN

---

## Tech Stack

- **Frontend:** React 19, Vite 6, TypeScript (strict), Tailwind CSS v4, React Router DOM (lazy code-splitting)
- **Forms & Validation:** React Hook Form, Zod
- **UI & Analytics:** Lucide React, Recharts, Plus Jakarta Sans & Inter
- **Backend & Database:** Supabase PostgreSQL 17, Supabase Auth, Supabase Storage (5 public buckets + 1 private bucket), Row Level Security (RLS), Transactional RPC (`SELECT ... FOR UPDATE`)
- **Hosting & CI/CD:** Vercel (Auto-deploy from `main`, SPA fallback & Security Headers in `vercel.json`)

---

## Ringkasan Modul (Phase 1 – Phase 10 Selesai)

1. **Website Publik:** Homepage editorial lengkap (Hero, Form Pencarian Properti, Proyek Unggulan, Pilihan Tipe Rumah, Keunggulan Developer, Fasilitas, Galeri Lightbox, Testimoni, FAQ), Daftar & Detail Proyek, Katalog Rumah interaktif tersinkronisasi URL, Detail Rumah dengan Denah SVG interaktif, Spesifikasi Bangunan, Google Maps, Simulasi KPR, serta Halaman Kontak tervalidasi Zod.
2. **Autentikasi & RBAC:** Registrasi Pelanggan, Login Pelanggan (`/login`), Login Administrator (`/admin/login`), Lupa & Reset Password, Profil & Ganti Sandi, Route Guards untuk 4 role (`customer`, `sales`, `admin`, `super_admin`), serta pemblokiran eskalasi role di level database trigger.
3. **Database Supabase & RLS:** 12 tabel utama + `app_settings`, 6 Storage Buckets (`payment-proofs` privat), RLS penuh di seluruh tabel, dan dokumentasi lengkap di [docs/SUPABASE_DATABASE.md](docs/SUPABASE_DATABASE.md).
4. **11 Modul CRUD Lengkap:** Projects, House Types, Units, Customers, Reservations, Payments, Payment Accounts, Banners, Galleries, Facilities, dan Administrators (khusus Super Admin) — lengkap dengan search, filter, pagination, detail modal, validasi form, confirmation dialog, soft delete, dan toast notification.
5. **Sistem Reservasi Anti Double-Booking:** Wizard 4 langkah (Proyek → Tipe → Unit Tersedia → Identitas), nomor reservasi otomatis (`RSV-YYYYMMDD-XXXX`), penguncian unit atomik via RPC `create_unit_reservation` (`SELECT ... FOR UPDATE`), hitung mundur real-time, pembatalan aman (`cancel_reservation`), dan pelepasan otomatis reservasi kedaluwarsa.
6. **Pembayaran Manual & Private Storage:** Rekening resmi developer, unggah bukti transfer ke bucket privat `payment-proofs` (validasi JPG/PNG/WEBP/PDF maks. 5 MB), pratinjau aman menggunakan **Signed URL**, serta panel verifikasi/penolakan dengan alasan wajib oleh administrator via RPC `verify_manual_payment`.
7. **Dashboard, Notifikasi & Laporan CSV:**
   - Dashboard Overview Administrator (8 KPI real-time, 3 grafik Recharts, feed Activity Logs).
   - Audit Trail (`Activity Logs`) dan Pengaturan Sistem Super Admin (`app_settings`).
   - Pusat Notifikasi Pelanggan (7 jenis event + pengingat otomatis reservasi akan kedaluwarsa + badge unread).
   - 5 Modul Laporan (Reservasi, Pembayaran, Penjualan, Unit Tersedia, Pelanggan) dengan filter periode & proyek serta ekspor CSV aman (UTF-8 BOM + proteksi formula injection).

---

## Instalasi & Menjalankan Lokal

```bash
npm install
cp .env.example .env.local
# Isi VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY (publishable/anon key publik)
npm run dev
```

## Build Production

```bash
npm run build
```

---

## Konfigurasi Environment Variables

| Variabel | Wajib | Keterangan |
| --- | --- | --- |
| `VITE_SUPABASE_URL` | Ya | URL project Supabase (`https://<ref>.supabase.co`) |
| `VITE_SUPABASE_ANON_KEY` | Ya | Supabase Publishable Key (`sb_publishable_...`) atau Legacy Anon Key |
| `VITE_APP_NAME` | Opsional | Default: `PERUMAHAN` |
| `VITE_DEMO_MODE` | Opsional | `false` untuk Supabase production; `true` untuk fallback data demo lokal |

> **Peringatan Keamanan:** Jangan pernah menaruh `SUPABASE_SERVICE_ROLE_KEY` atau secret key apa pun ke dalam environment variable frontend (`VITE_*`) maupun ke repository Git.

---

## Setup Database Supabase & Promosi Super Admin

1. Jalankan seluruh file migrasi SQL di folder `supabase/migrations/` secara berurutan (`0001` hingga `0005`) di Supabase SQL Editor.
2. Daftarkan akun pertama melalui halaman `/register`, lalu promosikan perannya menjadi `super_admin` melalui SQL Editor Supabase:
   ```sql
   UPDATE public.profiles
   SET role = 'super_admin'
   WHERE email = 'email-superadmin@domain.com';
   ```
3. Masuk melalui `/admin/login` untuk mengelola proyek, unit, verifikasi pembayaran, laporan, dan staff lainnya.

---

## Deployment ke Vercel

1. Hubungkan repository GitHub ke proyek Vercel dengan preset **Vite** (`Build Command: npm run build`, `Output Directory: dist`, `Node.js: 22.x`).
2. Tambahkan `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, dan `VITE_DEMO_MODE=false` pada **Project Settings → Environment Variables**.
3. Setiap push ke branch `main` otomatis membangun dan men-deploy ke production dengan SPA rewrite & security headers dari `vercel.json`.
