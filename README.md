# PERUMAHAN — Digital Real Estate & Reservation Platform

Platform digital developer properti modern yang berfungsi sebagai website pemasaran hunian sekaligus sistem manajemen reservasi unit, verifikasi pembayaran manual, dan dashboard administrasi penjualan.

## Tech Stack

- **Frontend:** React 19, Vite, TypeScript, Tailwind CSS v4, React Router DOM
- **UI & Visualization:** Lucide React, Recharts, Plus Jakarta Sans & Inter
- **Forms & Validation:** React Hook Form, Zod
- **Backend & Database (Phase 3–4):** Supabase PostgreSQL, Supabase Auth, Supabase Storage, Row Level Security (RLS)
- **Deployment:** Vercel (SPA rewrite configured in `vercel.json`)

## Struktur Folder Modular

```text
src/
├── assets/
├── components/
│   ├── common/
│   ├── forms/
│   ├── layout/
│   ├── tables/
│   └── ui/
├── contexts/
├── features/
│   ├── customers/
│   ├── home/
│   ├── house-types/
│   ├── payments/
│   ├── projects/
│   ├── reports/
│   ├── reservations/
│   └── units/
├── hooks/
├── lib/
├── pages/
│   ├── admin/
│   ├── auth/
│   ├── customer/
│   └── public/
├── routes/
├── schemas/
├── services/
├── supabase/
├── types/
└── utils/
supabase/
└── migrations/
public/
└── images/
```

## Menjalankan Secara Lokal

```bash
npm install
npm run dev
```

## Build Production

```bash
npm run build
```

## Environment Variables

Salin `.env.example` menjadi `.env.local` saat kredensial Supabase siap digunakan (Phase 3):

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

> **Catatan Keamanan:** Jangan pernah menempatkan `SUPABASE_SERVICE_ROLE_KEY` di environment frontend.
