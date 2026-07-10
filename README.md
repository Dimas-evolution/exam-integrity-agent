# Exam Integrity Agent

Sistem informasi ujian online (CBT) yang dilengkapi dengan fitur integritas untuk memantau kejujuran mahasiswa selama ujian berlangsung. Proyek ini dikembangkan sebagai Tugas Besar Mata Kuliah Pemrograman Fullstack.

## 🔗 Tautan Penting
- **Repository**: [GitHub - Exam Integrity Agent](https://github.com/Dimas-evolution/exam-integrity-agent.git)
- **Live Deployment**: [Vercel Deployment](https://exam-integrity-agent.vercel.app/login)

---

## 🌊 Flow Aplikasi (Alur Kerja)

1. **Autentikasi (Login/Register)**
   - Pengguna (Dosen/Mahasiswa) login menggunakan kredensial yang valid.
   - Sistem akan membedakan role (hak akses) pengguna secara otomatis.

2. **Dashboard Guru / Dosen**
   - **Manajemen Ujian**: Dosen dapat melihat dan membuat jadwal ujian baru.
   - **Pemantauan Mahasiswa**: Dosen dapat memonitor aktivitas mahasiswa, melihat hasil ujian, serta melihat status integritas dari ujian yang dikerjakan mahasiswa.

3. **Dashboard Mahasiswa**
   - **Akses Ujian**: Mahasiswa dapat melihat daftar ujian yang tersedia untuk mereka.
   - **Pelaksanaan Ujian (Exam)**: Mahasiswa mengerjakan ujian pada antarmuka yang terisolasi. Sistem (agent) akan memantau integritas selama ujian berlangsung.
   - **Hasil Ujian**: Setelah selesai, mahasiswa dapat melihat skor dan hasil dari ujian yang telah dikerjakan.

---

## 💻 Bahasa Pemrograman & Teknologi

Proyek ini dibangun menggunakan pendekatan Fullstack *Monorepo* dengan *stack* modern:

*   **Frontend & Backend Framework**: Next.js 16 (App Router)
*   **Bahasa Pemrograman**: TypeScript (Superset dari JavaScript)
*   **UI / Styling**: 
    *   Tailwind CSS v4 (Styling)
    *   Framer Motion (Animasi dan Transisi UI)
    *   Lucide React (Iconography)
*   **Database & Authentication**: Supabase (PostgreSQL)
*   **Deployment & Hosting**: Vercel

---

## ⚙️ Informasi Teknis

*   **Arsitektur**: SSR (Server-Side Rendering) dan CSR (Client-Side Rendering) digabungkan menggunakan Next.js App Router.
*   **Database Schema & ORM**: Terhubung ke database PostgreSQL menggunakan integrasi SDK langsung dari `@supabase/supabase-js` dan `@supabase/ssr`.
*   **Pengamanan Rute**: Middleware dari Next.js dan Supabase Auth memastikan hanya pengguna dengan token valid yang dapat mengakses dashboard (Guru/Mahasiswa).
*   **Menjalankan secara Lokal (Development)**:
    1. Lakukan `npm install`
    2. Jalankan server menggunakan perintah `npm run dev`
    3. Buka `http://localhost:3000`

## 👥 Informasi Non-Teknis

*   **Tujuan Proyek**: Membangun sistem ujian yang tidak hanya fokus pada penilaian, tetapi juga meminimalisir potensi kecurangan melalui pemantauan integritas.
*   **Target Pengguna**: Institusi pendidikan, Dosen, dan Mahasiswa.
*   **Pengembangan Berkelanjutan**: Sistem dirancang secara modular pada folder `components/` dan `app/` agar mudah dikembangkan lebih lanjut di masa mendatang (seperti penambahan fitur pengenalan wajah atau AI proctoring).
