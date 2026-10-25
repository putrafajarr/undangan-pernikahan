# Sistem Undangan Pernikahan Digital Mewah (Fullstack React.js & Express)

Sistem undangan pernikahan digital modern, responsif, dan elegan dengan integrasi Backend API, Database persisten, dan Portal Dashboard Manajemen Pengantin yang lengkap.

---

## ✨ Fitur Unggulan

### 👰‍♀️ Frontend (Undangan Tamu)
- **Cover Pembuka Interaktif**: Amplop digital dengan nama tamu personal (`?to=Nama+Tamu`) dan tombol *Buka Undangan*.
- **Efek Visual Mewah**: Hujan kelopak emas (*golden petals*) dan kilauan partikel halus mengalir di latar belakang.
- **Musik Latar Belakang (Romantic Melody)**: Pemutar audio mengambang dengan visual piringan hitam emas berputar, dapat di-pause/play kapan saja.
- **Profil Mempelai Pria & Wanita**: Menampilkan foto asli kedua mempelai dalam bingkai kubah emas, nama lengkap, gelar, orang tua, dan tautan Instagram.
- **Rangkaian Acara & Countdown**: Hitung mundur otomatis (Hari, Jam, Menit, Detik), jadwal Akad Nikah & Resepsi Makan Siang, tombol *Petunjuk Arah (Google Maps)*, serta tombol *Simpan ke Google Calendar*.
- **Kisah Cinta (Love Story)**: Linimasa perjalanan cinta dari pertemuan pertama hingga hari pernikahan.
- **Galeri Foto & Video Lightbox**: Galeri foto pre-wedding dengan pop-up zoom layar penuh dan navigasi slide.
- **Buku Tamu & RSVP Live**:
  - Formulir konfirmasi kehadiran (Hadir, Berhalangan, Ragu-ragu), jumlah porsi, kategori hubungan, serta doa restu.
  - Efek ledakan confetti saat tamu mengirim doa!
  - Buku tamu real-time yang langsung tersimpan ke backend database dengan fitur *Like/Love*.
- **Amplop Digital (Tanda Kasih)**:
  - Nomor Rekening Bank BCA, Mandiri, dan BSI dengan tombol **1-Klik Salin Nomor Rekening**.
  - Fitur Amplop Digital transfer bank & kirim kado langsung.
  - Alamat pengiriman kado fisik dengan tombol salin alamat.
- **Navigasi Dock Bawah**: Menu mengambang responsif dengan deteksi bagian aktif saat digulir.

---

### 🛡️ Dashboard Manajemen Pengantin (Admin Portal)
Akses melalui tombol **"Admin Portal"** di pojok kiri atas undangan atau tambahkan parameter `?admin=true` pada URL.

- **Proteksi PIN Keamanan**: Dilengkapi keamanan PIN (Default: `1234`).
- **Monitoring & Statistik Real-Time**:
  - Total tamu yang telah mengisi RSVP
  - Jumlah tamu yang hadir
  - Estimasi total porsi katering yang dibutuhkan
  - Jumlah tamu yang berhalangan hadir
- **Generator Undangan WhatsApp**:
  - Masukkan nama tamu (misal: *Bapak Dr. Hendra & Istri*) dan nomor telepon (opsional).
  - Sistem otomatis menyusun pesan undangan resmi yang sopan dan rapi serta menyematkan link unik `?to=...`.
  - Tombol **Kirim ke WhatsApp** (langsung membuka WhatsApp dengan pesan siap kirim).
  - Menyimpan daftar tamu undangan yang sudah dibuat.
- **Kelola Buku Tamu**: Melihat seluruh pesan doa yang masuk dan menghapus pesan spam/tes.
- **Download Data RSVP (Excel/CSV)**: 1-klik unduh seluruh rekap kehadiran dan doa tamu ke file `.csv` siap buka di Microsoft Excel.
- **Editor Data Live**: Ubah nama mempelai, tanggal acara, jam, lokasi gedung, dan nomor rekening langsung dari web tanpa perlu coding!

---

## 🚀 Cara Menjalankan Secara Lokal

### 1. Menjalankan Server Produksi Siap Pakai:
```bash
npm start
```
Aplikasi langsung berjalan di:
- **URL**: `http://localhost:5000`

### 2. Mode Pengembangan (Development Mode):
```bash
# Menjalankan backend dan frontend bersamaan
npm run dev
```
Atau secara terpisah:
- Backend: `npm run dev:backend` (port 5000)
- Frontend: `npm run dev:frontend` (port 5173 dengan proxy otomatis ke backend)

---

## 🌐 Panduan Siap Hosting (Deploy)

Aplikasi ini telah dikonfigurasi dengan arsitektur **Universal Single Service** di mana Express backend secara otomatis menyajikan file frontend hasil build (`frontend/dist`) dan API RESTful (`/api/...`) pada satu port yang sama!

### A. Deploy ke Render.com / Railway.app
1. Hubungkan repository GitHub proyek ini.
2. Atur konfigurasi:
   - **Build Command**: `npm run build`
   - **Start Command**: `npm start`
3. Aplikasi akan otomatis aktif dan online!

### B. Deploy ke VPS / Ubuntu (Nginx + PM2)
```bash
# 1. Install dependensi
npm run install:all

# 2. Build frontend
npm run build

# 3. Jalankan backend dengan PM2
pm2 start backend/server.js --name "undangan-nikah"
```

### C. Deploy ke cPanel / Cloud Hosting
1. Unggah folder proyek.
2. Di menu **Setup Node.js App**, arahkan Application startup file ke `backend/server.js`.
3. Jalankan `npm run build` di terminal cPanel.
4. Klik Restart App.

---

## 📁 Struktur Direktori
```
undangan/
├── backend/
│   ├── data/
│   │   └── database.json    # Database JSON persisten
│   ├── database.js          # Controller & query database
│   ├── server.js            # Express API server & static host
│   └── package.json
├── frontend/
│   ├── public/
│   │   └── images/
│   │       ├── groom.jpg    # Foto Mempelai Pria
│   │       └── bride.jpg    # Foto Mempelai Wanita
│   ├── src/
│   │   ├── components/      # Cover, Hero, Couple, Event, RSVP, AdminModal, dll.
│   │   ├── App.jsx          # Komponen Utama
│   │   └── index.css        # Sistem Desain & Animasi Mewah
│   ├── dist/                # Hasil build produksi siap hosting
│   └── vite.config.js
├── package.json             # Root script (build & start)
├── start.js                 # Launcher multi-process lokal
└── README.md
```
