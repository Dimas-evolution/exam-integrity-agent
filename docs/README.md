# ExamGuard

> Sistem Pemantauan Integritas Ujian Online Berbasis AI

![Next.js](https://img.shields.io/badge/Next.js-16.2-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Supabase](https://img.shields.io/badge/Supabase-Realtime-green)
![License](https://img.shields.io/badge/License-Akademik-red)

---

## 1. Deskripsi Proyek

ExamGuard merupakan sistem pemantauan integritas ujian online yang didukung oleh kecerdasan buatan. Sistem ini dirancang untuk memastikan keadilan dalam proses penilaian di lingkungan pendidikan. Platform ini menyediakan kemampuan pemantauan secara realtime yang dapat mendeteksi dan mendokumentasikan perilaku mencurigakan selama sesi ujian berlangsung.

### Tujuan Proyek

- Menjaga integritas akademik dalam pelaksanaan ujian online
- Memberikan keterbacaan kepada guru terhadap aktivitas mahasiswa
- Menciptakan lingkungan ujian yang aman dan bebas gangguan
- Menghasilkan laporan pelanggaran yang komprehensif untuk ditinjau

### Permasalahan yang Diatasi

Ujian online tradisional memiliki keterbatasan dalam mekanisme pemantauan. Mahasiswa dengan mudah dapat berpindah tab, menyalin konten, atau keluar dari jendela ujian. ExamGuard mengatasi kelemahan ini dengan menerapkan sistem deteksi berlapis yang melacak aktivitas mencurigakan dan memberikan informasi yang dapat ditindaklanjuti kepada guru.

### Fitur Utama

- **Pemantauan Realtime**: Pelacakan langsung sesi ujian mahasiswa
- **Integrity Agent**: Deteksi berbasis client-side untuk perilaku mencurigakan
- **Analisis Risiko**: Pemberian skor otomatis terhadap aktivitas mahasiswa
- **Lini Waktu Pelanggaran**: Dokumentasi kronologis seluruh kejadian yang terdeteksi
- **Dashboard Berbasis Peran**: Antarmuka terpisah untuk mahasiswa dan guru
- **Desain Responsif**: Fungsi lengkap di berbagai ukuran layar

---

## 2. Arsitektur Sistem

```
exam-integrity-agent/
├── app/                          # Halaman Next.js App Router
│   ├── auth/                     # Rute autentikasi
│   ├── dashboard-guru/          # Dashboard guru
│   ├── dashboard-mahasiswa/     # Dashboard mahasiswa
│   │   └── exam/
│   │       └── [id]/            # Halaman sesi ujian dinamis
│   ├── login/                   # Halaman login
│   ├── profile/                 # Manajemen profil pengguna
│   ├── settings/                # Pengaturan aplikasi
│   ├── signup/                  # Halaman pendaftaran
│   ├── globals.css              # Stylesheet global
│   ├── layout.tsx              # Layout utama
│   └── page.tsx                 # Halaman beranda
├── components/                   # Komponen React
│   ├── auth/                    # Komponen autentikasi
│   ├── exam/                    # Komponen terkait ujian
│   ├── navbar.tsx              # Komponen navigasi
│   ├── student/                # Komponen khusus mahasiswa
│   │   ├── exam-workspace.tsx  # Antarmuka mengerjakan ujian
│   │   └── student-dashboard-content.tsx
│   ├── teacher/                 # Komponen khusus guru
│   │   ├── teacher-dashboard.tsx
│   │   ├── student-card.tsx    # Kartu pemantauan mahasiswa
│   │   ├── kpi-card.tsx        # Indikator kinerja utama
│   │   ├── live-activity-bar.tsx
│   │   └── question-heatmap.tsx
│   └── ui/                     # Komponen UI yang dapat digunakan ulang
│       ├── scientific-background.tsx
│       ├── security-alert.tsx
│       └── toast.tsx
├── hooks/                       # Custom React hooks
│   └── use-integrity-agent.ts  # Hook pemantauan integritas utama
├── lib/                         # Library utilitas
│   ├── supabase/               # Konfigurasi Supabase client
│   │   ├── client.ts           # Client untuk browser
│   │   └── server.ts           # Client untuk server
│   ├── utils.ts                # Utilitas umum
│   └── utils/
│       └── date.ts             # Utilitas format tanggal
├── public/                      # Aset statis
├── supabase/                   # Konfigurasi database
│   └── schema.sql              # Skema database lengkap
├── types/                      # Definisi tipe TypeScript
│   └── supabase.ts             # Tipe yang dihasilkan Supabase
├── docs/                       # Dokumentasi
│   └── DESIGN.md               # Dokumentasi sistem desain
├── .env.example                # Template variabel lingkungan
├── eslint.config.mjs           # Konfigurasi ESLint
├── next.config.ts              # Konfigurasi Next.js
├── package.json                # Daftar dependensi
├── postcss.config.mjs          # Konfigurasi PostCSS
├── tailwind.config.ts          # Konfigurasi Tailwind CSS
└── tsconfig.json               # Konfigurasi TypeScript
```

---

## 3. Teknologi yang Digunakan

| Teknologi | Versi | Fungsi |
|------------|---------|---------|
| **Next.js** | 16.2 | Framework React dengan App Router |
| **TypeScript** | 5 | JavaScript dengan type safety |
| **Tailwind CSS** | 4 | Styling dengan pendekatan utility-first |
| **Supabase** | 2.108 | Backend as a service, database, autentikasi |
| **Framer Motion** | 12.41 | Library animasi |
| **Lucide React** | 1.21 | Library ikon |
| **clsx** | 2.1.1 | Class name kondisional |
| **tailwind-merge** | 3.6 | Penggabungan class Tailwind |

---

## 4. Fitur Aplikasi

### Mahasiswa

| Fitur | Deskripsi |
|---------|-------------|
| **Login ke sistem** | Autentikasi aman dengan email dan password |
| **Melihat daftar ujian** | Dashboard untuk melihat ujian tersedia, sesi aktif, dan ujian selesai |
| **Mengikuti ujian** | Antarmuka interaktif untuk mengerjakan soal |
| **Menjawab soal** | Pemilihan jawaban atau penulisan esai |
| **Penyimpanan otomatis** | Jawaban disimpan secara otomatis untuk mencegah kehilangan data |
| **Mengumpulkan ujian** | Pengumpulan dengan konfirmasi |
| **Melihat hasil** | Peninjauan detail ujian yang telah dikerjakan |
| **Mengubah profil** | Pembaruan informasi pribadi |

### Guru

| Fitur | Deskripsi |
|---------|-------------|
| **Security Monitoring Center** | Dashboard pemantauan realtime |
| **Live Activity Feed** | Pemberitahuan langsung untuk event ujian |
| **Memantau peserta** | Kartu individu mahasiswa dengan detail aktivitas |
| **Deteksi pelanggaran** | Pendeteksian dan pencatatan otomatis perilaku mencurigakan |
| **Analisis risiko** | Visualisasi skor risiko per mahasiswa |
| **Filter sesi** | Penyaringan berdasarkan status (aktif, dikumpulkan, risiko tinggi) |
| **Pencarian** | Pencarian cepat mahasiswa atau ujian |

### Sistem

| Fitur | Deskripsi |
|---------|-------------|
| **Autentikasi** | Supabase Auth dengan akses berbasis peran (guru/mahasiswa) |
| **Update Realtime** | Pemantauan langsung melalui Supabase Realtime |
| **Tampilan Responsif** | Dioptimalkan untuk layar 320px hingga 1920px+ |
| **Routing Berbasis Peran** | Pengalihan otomatis berdasarkan peran pengguna |
| **Pembuatan Profil Otomatis** | Pembuatan profil otomatis saat pendaftaran |

---

## 5. Sistem Deteksi Kecurangan

Integrity agent (`useIntegrityAgent` hook) memantau dan mendeteksi perilaku berikut:

| Jenis Deteksi | Tipe Event | Deskripsi |
|----------------|------------|-------------|
| **Berpindah Tab** | `tab_switch` | Mendeteksi ketika jendela ujian kehilangan fokus |
| **Jendela Tidak Aktif** | `tab_switch` | Memantau event fokus/non-fokus pada jendela |
| **Kehilangan Fokus** | `visibility_hidden` | Berlangsung ketika dokumen menjadi tersembunyi |
| **Durasi Kembali** | `visibility_hidden` | Mencatat waktu away dari ujian (batas: 5 detik) |
| **Mouse Keluar** | `mouse_leave` | Mendeteksi mouse keluar dari bagian atas viewport |
| **Salin/Tempel** | `copy_paste` | Memantau operasi salin, tempel, dan potong |
| **Shortcut Keyboard** | Pencegahan | Memblokir Ctrl+C, Ctrl+V, Ctrl+P, F12, DevTools |

### Pemberian Skor Risiko

Setiap pelanggaran berkontribusi terhadap skor risiko mahasiswa:

| Jenis Pelanggaran | Poin Risiko |
|----------------|-------------|
| Salin/Tempel | 30 |
| Visibilitas Tersembunyi | 25 |
| Berpindah Tab | 15 |
| Mouse Keluar | 10 |

Mahasiswa dengan skor di atas 50 ditandai sebagai **risiko tinggi**.

---

## 6. Struktur Basis Data

### Tabel

| Tabel | Deskripsi | Field Utama |
|-------|-------------|------------|
| `profiles` | Profil pengguna dan peran | id, role, name, created_at |
| `exams` | Definisi ujian | id, title, description, teacher_id, duration_minutes |
| `questions` | Soal ujian | id, exam_id, question_text, question_order, question_type, options, correct_answer |
| `exam_sessions` | Instance ujian aktif | id, exam_id, student_id, current_question_index, status, started_at, completed_at |
| `student_answers` | Respons mahasiswa | id, session_id, question_id, answer, answered_at |
| `cheating_events` | Log pelanggaran | id, session_id, event_type, question_number, duration_seconds, details |

### Row Level Security

Seluruh tabel memiliki kebijakan RLS (Row Level Security) yang memastikan:
- Mahasiswa hanya dapat mengakses data mereka sendiri
- Guru dapat melihat seluruh data mahasiswa untuk ujian mereka
- Pembaruan profil dibatasi hanya untuk pemiliknya

---

## 7. Hak Akses Pengguna

| Peran | Izin |
|------|-------------|
| **Mahasiswa** | Mengikuti ujian, melihat hasil sendiri, mengubah profil sendiri, submisi jawaban |
| **Guru** | Melihat seluruh sesi ujian, memantau mahasiswa, melihat pelanggaran, membuat soal ujian |

---

## 8. Cara Instalasi

### Persyaratan

- Node.js versi 18 atau lebih baru
- npm atau yarn
- Akun Supabase (local atau cloud)

### Langkah-langkah

```bash
# Clone repository
git clone https://github.com/your-repo/exam-integrity-agent.git](https://github.com/Dimas-evolution/exam-integrity-agent.git
cd exam-integrity-agent

# Install dependensi
npm install

# Salin variabel lingkungan
cp .env.example .env.local

# Konfigurasi kredensial Supabase di .env.local

# Untuk alasan keamanan, kredensial Supabase tidak dipublikasikan pada repositori. Repository hanya menyertakan .env.example sebagai template konfigurasi. File .env.local digunakan secara lokal dan diserahkan kepada dosen pembimbing atau penguji melalui media terpisah apabila diperlukan untuk proses pengujian.
```

---

## 9. Konfigurasi Environment Variables

Buat file `.env.local` berdasarkan `.env.example`:

```env
# Konfigurasi Supabase
NEXT_PUBLIC_SUPABASE_URL=url_project_supabase_anda
NEXT_PUBLIC_SUPABASE_ANON_KEY=anon_key_supabase_anda
SUPABASE_SERVICE_ROLE_KEY=service_role_key_supabase_anda
```

### Penjelasan Variabel

| Variabel | Deskripsi |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL project Supabase Anda |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Anon key publik untuk akses client-side |
| `SUPABASE_SERVICE_ROLE_KEY` | Admin key server-side (jaga kerahasiaannya) |

---

## 10. Konfigurasi Database

### Opsi 1: Migrasi SQL

Jalankan skema lengkap dari `supabase/schema.sql`:

```sql
-- Hubungkan ke Supabase SQL Editor dan eksekusi:
-- supabase/schema.sql
```

### Opsi 2: Supabase CLI

```bash
# Hubungkan project Supabase
npx supabase link --project-ref your-project-ref

# Push migrasi
npx supabase db push
```

Skema mencakup:
- Pembuatan tabel dengan constraint yang tepat
- Indeks untuk optimasi performa
- Kebijakan Row Level Security
- Trigger untuk pembuatan profil otomatis
- Publikasi realtime untuk pemantauan

---

## 11. Menjalankan Aplikasi

```bash
# Mode development
npm run dev

# Build production
npm run build

# Jalankan server production
npm start

# Jalankan linting
npm run lint
```

---

## 12. Akun Demo

### Akun Guru

| Field | Nilai |
|-------|-------|
| Email | teacher@test.com |
| Password | password123 |


### Akun Mahasiswa

| Field | Nilai |
|-------|-------|
| Email | student@test.com |
| Password | password123 |

---

## 13. Alur Sistem

### Alur Mahasiswa

```
1. Login → Dashboard Mahasiswa
2. Melihat Ujian Tersedia
3. Mulai Ujian → Membuat Sesi
4. Mengerjakan Ujian:
   - Membaca Soal
   - Memilih/Menulis Jawaban
   - Berpindah Antar Soal
   - Penyimpanan otomatis setiap jawaban
5. Mengumpulkan Ujian
6. Melihat Hasil (opsional)
```

### Alur Guru

```
1. Login → Dashboard Guru (Security Monitoring Center)
2. Melihat Live Activity Feed
3. Memantau KPI Cards:
   - Total Mahasiswa
   - Sesi Aktif
   - Sesi Selesai
   - Pelanggaran
   - Ringkasan Risiko
4. Filter Sesi:
   - Semua / Aktif / Dikumpulkan
   - Risiko Tinggi / Aman / Peringatan / Kritis
5. Mencari Mahasiswa atau Ujian
6. Klik Kartu Mahasiswa untuk Detail
7. Meninjau Lini Waktu Pelanggaran
```

---

## 14. Fitur Realtime

Sistem menerapkan langganan Supabase Realtime untuk pemantauan langsung:

| Channel | Tabel | Events | Tujuan |
|---------|-------|--------|--------|
| `teacher-monitoring` | `cheating_events` | INSERT | Pemberitahuan pelanggaran realtime |

Ketika mahasiswa memicu pelanggaran:
1. Event dicatat ke tabel `cheating_events`
2. Supabase Realtime mendorong event ke seluruh guru yang terhubung
3. Dashboard guru diperbarui segera tanpa refresh
4. Live activity bar menampilkan pemberitahuan baru

---

## 15. Responsive Design

Aplikasi memiliki tampilan responsif di seluruh breakpoint:

| Breakpoint | Lebar | Tata Letak |
|------------|-------|-----------|
| Mobile XS | 320px - 375px | Kolom tunggal, elemen bertumpuk |
| Mobile | 375px - 768px | Kolom tunggal, target sentuh optimal |
| Tablet | 768px - 1024px | Grid dua kolom jika sesuai |
| Desktop | 1024px+ | Tata letak lengkap dengan navigasi samping |
| Large Desktop | 1440px+ | Area konten yang diperluas |

---

## 16. Screenshot

### Dashboard Mahasiswa

```
┌─────────────────────────────────────────────────────────────┐
│  🛡 ExamGuard                                    [Avatar ▼] │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Ujian Anda                                                 │
│  Ruang fokus untuk penilaian Anda                           │
│                                                             │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐                   │
│  │ ● Aktif│  │✓ Selesai │  │📚 Total │                   │
│  │    1    │  │    2     │  │    5    │                   │
│  └─────────┘  └─────────┘  └─────────┘                   │
│                                                             │
│  Ujian Tersedia                                             │
│  ┌─────────────────────────────────────────────────────────┐│
│  │ 📘  Pengantar Pemrograman                  [Mulai Ujian ▶]││
│  │     Pilihan ganda • 60 menit                            ││
│  └─────────────────────────────────────────────────────────┘│
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Dashboard Guru

```
┌─────────────────────────────────────────────────────────────┐
│  🛡 ExamGuard                                    [Avatar ▼] │
├─────────────────────────────────────────────────────────────┤
│  🔴 LIVE: Perpindahan tab terdeteksi - John Doe             │
├─────────────────────────────────────────────────────────────┤
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌─────────┐ │
│  │ 👥 12│ │ ✓  5 │ │ ✓  7 │ │ ⚠ 8 │ │ 🔴 3 │ │ Aman 5 │ │
│  │Mahasis│ │ Aktif│ │Seles │ │Pelang│ │ Ris. │ │Warn 3  │ │
│  └──────┘ └──────┘ └──────┘ └──────┘ └──────┘ │Krit 0 │ │
│                                               └─────────┘ │
│  [Semua] [Aktif] [Selesai] [Ris.Tinggi] [Aman] [Peringatan]│
│  🔍 Cari...                                               │
│                                                             │
│  ┌──────────────────────┐  ┌──────────────────────┐       │
│  │ 👤 John Doe          │  │ 👤 Jane Smith        │       │
│  │ 📘 Ujian Matematika  │  │ 📘 Ujian Matematika  │       │
│  │ ⚠ 3 pelanggaran      │  │ ✓ Tanpa pelanggaran  │       │
│  │ Risiko: ████░░ 60%   │  │ Risiko: ░░░░░ 0%    │       │
│  │ [Lihat Detail]       │  │ [Lihat Detail]       │       │
│  └──────────────────────┘  └──────────────────────┘       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 17. Pengembangan Selanjutnya

Fitur yang direncanakan untuk pengembangan selanjutnya:

- **Deteksi Wajah AI**: Pengenalan wajah berbasis webcam selama ujian
- **Deteksi Perekaman Layar**: Pemantauan perangkat lunak perekaman layar
- **Browser Lockdown**: Penerapan mode layar penuh wajib
- **Deteksi Suara**: Pemantauan audio untuk suara mencurigakan
- **Ekspor PDF**: Pembuatan laporan pelanggaran yang dapat dicetak
- **Notifikasi Email**: Pemberitahuan via email untuk pelanggaran kritis
- **Timer Ujian**: Hitung mundur dengan peringatan
- **Bank Soal**: Template soal yang dapat digunakan kembali
- **Dashboard Analitik**: Tren performa historis
- **Dukungan Multi-bahasa**: Internasionalisasi untuk institusi internasional

---

## 18. Lisensi

Proyek ini dikembangkan untuk keperluan akademis.

**Lisensi**: Proyek Akademis - Hanya untuk Penggunaan Edukatif

---

## 19. Penulis

| Field | Nilai |
|-------|-------|
| Proyek | ExamGuard |
| Tipe | Proyek Akhir |
| Tahun | 2026 |
| Tujuan | Sistem Pemantauan Integritas Ujian Online Berbasis AI |

---
