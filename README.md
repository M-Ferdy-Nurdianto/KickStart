# Kickstart - Fresh Windows, ready in minutes ⚡

Aplikasi desktop Windows modern untuk setup komputer Windows baru. Pilih puluhan software favoritmu (Browser, IDE, Dev Tools, Office, Media, Gaming, ekosistem ArtCraft Suite, hingga Driver Center), lalu instal sekaligus secara otomatis dengan indikator progress yang detail dan penanganan error yang andal.

> **Credit:** [ig@ikifer](https://instagram.com/ikifer)  
> **Bahasa:** Indonesia santai  
> **Teknologi:** Electron + React (Vite) + TypeScript + Vanilla CSS Design Tokens

---

## 🌟 Fitur Utama

- **Dua Sumber Instalasi Terpadu:**
  - **winget**: Instalasi silent otomatis tanpa prompt (`--silent --accept-package-agreements --accept-source-agreements --disable-interactivity`).
  - **GitHub Releases (ArtCraft Ecosystem)**: Auto fetch rilis terbaru (ArtCraft, PhotoCraft, LightCraft, FilmCraft, VectorCraft, PdfCraft, EffectCraft, DesignCraft), auto match installer `.msi` / `.exe` sesuai arsitektur mesin (`x64` atau `arm64`), streaming download dengan kecepatan (MB/s) & ETA, resume/retry otomatis hingga 3x, verifikasi checksum integritas SHA-256 (`digest`), dan eksekusi silent (`msiexec /qn /norestart`).
- **Driver Center Terintegrasi:**
  - Pindai hardware dan perangkat bermasalah / tanpa driver (`Get-PnpDevice` & WMI/CIM).
  - Jalur utama via **Windows Update Driver Catalog** (COM `Microsoft.Update.Session`).
  - Deteksi vendor GPU (NVIDIA / AMD / Intel) dan tawarkan tool resmi via winget.
  - Deteksi vendor OEM (Lenovo, Dell, HP, ASUS, Acer, MSI) dan tawarkan utility resmi.
  - Cadangan darurat: Snappy Driver Installer Origin (SDIO open-source).
  - Keamanan wajib: pembuatan **System Restore Point** & backup driver terpasang (`Export-WindowsDriver`).
  - Cek reboot requirement (exit code 3010) & salin laporan hardware teks.
- **Tampilan Modern & Rapi (Design Tokens):**
  - Palet warna dark mode sleek: `--bg:#0c0e14`, `--surface:#12151d`, `--border:#232836`, `--green:#3ddc97`, `--blue:#5b9dff`, `--purple:#a78bfa`.
  - Logo brand asli menggunakan paket `simple-icons` dengan fallback monogram netral.
  - Toggle tampilan **Grid <-> List** (Mode List sebagai default yang padat dan informatif).
  - Status bar ringkas satu baris (titik warna kecil + teks muted).
  - Banner peringatan non-admin dengan tombol elevasi otomatis.
  - Kalkulasi sisa kapasitas disk & perkiraan ukuran unduhan sebelum memasang.
- **Profil Preset Sekali Klik:**
  - Preset bawaan: **Web Dev**, **Content Creator**, **Gamer**, **Kantor & Administrasi**, **Minimalis**.
  - Simpan racikan software custom sendiri.
  - Ekspor & Impor preset dalam format `.json`.
- **Pre-Flight System Check:**
  - Deteksi hak akses Administrator.
  - Deteksi keberadaan & versi `winget`.
  - Cek konektivitas internet & sisa ruang Drive `C:\`.
- **Tab Tweaks & System Cleaner (Bebas KMS):**
  - Pembersihan file temporary `%TEMP%`, cache update, prefetch, dan Recycle Bin.
  - Manajemen daya / file hibernasi (`powercfg`).
  - System File Checker (`sfc /scannow`) & DISM Image Restore.
  - Laporan sistem lengkap dan tambah pengguna/admin baru secara aman.
- **Sistem Logging & Konfigurasi:**
  - File log tersimpan rapi di `%APPDATA%/Kickstart/logs/kickstart-YYYY-MM-DD.log`.
  - Konfigurasi dan preset di `%APPDATA%/Kickstart/`.
  - Otomatis migrasi data lama dari `%APPDATA%/SetupInul` jika ditemukan.

---

## 🛠️ Panduan Pengembangan (Development)

### Prasyarat
- Windows 10 atau Windows 11 (64-bit disarankan)
- Node.js (v18 ke atas, disarankan Node v20+)
- npm (v9 ke atas)
- Windows Package Manager (`winget`)

### Instalasi Dependensi
```bash
npm install
```

### Menjalankan Mode Development
Jalankan perintah berikut untuk membuka aplikasi Kickstart secara live dengan Hot Reload:
```bash
npm run dev
```

### Menjalankan Unit Test
```bash
npm test
```

---

## 📦 Membangun File Installer (.exe)

Aplikasi dibuild menggunakan `electron-builder` dengan konfigurasi `requestedExecutionLevel = requireAdministrator`. Output akan menghasilkan **NSIS Installer** dan file **Portable .exe**.

Jalankan perintah:
```bash
npm run dist
```

File `.exe` hasil build akan tersimpan di dalam folder:
```
release/
  ├── Kickstart-Setup-1.0.0.exe        (NSIS Installer)
  └── Kickstart-1.0.0-portable.exe     (Standalone Portable Executable)
```

---

## 🔒 Keamanan & Praktik Terbaik (Security)

1. **IPC & Preload Terisolasi**: Renderer tidak memiliki akses langsung ke `child_process` atau modul Node.js internal (`contextIsolation: true`, `nodeIntegration: false`). Semua eksekusi sistem hanya ditangani oleh Main Process melalui IPC terverifikasi.
2. **Spawn Arguments Array**: Semua perintah sistem dijalankan dengan array argumen terpisah untuk mencegah celah *command injection*.
3. **Privasi Password**: Password pada fitur pembuatan user baru di-mask di form UI dan difilter agar tidak pernah dicatat ke dalam log.
4. **Verifikasi Hash SHA-256**: Mengunduh rilis GitHub akan memvalidasi hash SHA-256 jika field digest tersedia di API.
5. **Konfirmasi Aksi Berisiko**: Fitur pembersihan Event Log, modifikasi Windows Update, dan pemasangan Driver dilindungi dialog konfirmasi eksplisit.
6. **Bebas KMS / Aktivasi Ilegal**: Kickstart bersih dari kode exploit/aktivasi bajakan.

---

Credit: [ig@ikifer](https://instagram.com/ikifer)
