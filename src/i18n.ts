export const i18n = {
  appTitle: 'Kickstart',
  appSubtitle: 'Fresh Windows, ready in minutes',
  credit: 'Credit: ig@ikifer',
  creditFull: 'Dibuat dengan ❤️ oleh ig@ikifer untuk anak teknik & pengguna Windows baru.',
  searchPlaceholder: 'Cari aplikasi (nama, deskripsi, kategori)...',

  // Filters
  filterAll: 'Semua',
  filterNotInstalled: 'Belum Terinstal',
  filterSelected: 'Terpilih',
  selectAll: 'Pilih Semua',
  deselectAll: 'Batal Pilih Semua',

  // Categories
  categories: {
    all: 'Semua Kategori',
    'Browser': 'Browser',
    'IDE & Editor': 'IDE & Editor',
    'Dev Tools': 'Dev Tools',
    'Server & DB': 'Server & DB',
    'Office & Desain': 'Office & Desain',
    'Utilities': 'Utilities',
    'Sosmed': 'Sosmed & Chat',
    'Media': 'Media & Audio',
    'Gaming': 'Gaming',
    'Drivers & Runtimes': 'Drivers & Runtimes',
    'Creative (ArtCraft)': 'Creative (ArtCraft)',
    'Drivers': 'Driver Center',
    'Tweaks': 'Tweaks & Cleaner'
  },

  // Badges
  installedBadge: 'Terinstall',
  updateBadge: 'Ada Update',
  artcraftBadge: 'ArtCraft Suite',

  // Presets
  presetsTitle: 'Preset Profil Sekali Klik',
  presetsSubtitle: 'Pilih paket siap pakai atau simpan racikan software favoritmu sendiri!',
  savePresetBtn: 'Simpan Pilihan Jadi Preset',
  exportPresetBtn: 'Ekspor JSON',
  importPresetBtn: 'Impor JSON',
  deletePresetConfirm: 'Hapus preset ini?',

  // Pre-flight status
  adminActive: 'Akses Admin Aktif',
  adminMissing: 'Bukan Administrator (Beberapa app mungkin gagal)',
  wingetReady: 'Winget Siap',
  wingetMissing: 'Winget Tidak Ditemukan! Klik untuk panduan instal.',
  internetConnected: 'Internet Terhubung',
  internetOffline: 'Offline / Internet Terputus',
  diskSpace: 'Sisa Disk C:',

  // Install Queue
  queueTitle: 'Antrean Instalasi',
  startInstallBtn: 'Pasang',
  installing: 'Sedang Memasang...',
  cancelBtn: 'Batal',
  cancelAllBtn: 'Batalkan Semua',
  retryFailedBtn: 'Coba Ulang yang Gagal',
  closeBtn: 'Tutup',
  parallelSettings: 'Instal Paralel',
  skipInstalledLabel: 'Lewati aplikasi yang sudah terinstall',

  // Status labels
  status: {
    idle: 'Menunggu',
    queued: 'Dalam Antrean',
    downloading: 'Mengunduh',
    verifying: 'Verifikasi Hash',
    installing: 'Memasang...',
    completed: 'Beres Terpasang',
    failed: 'Gagal Terpasang',
    cancelled: 'Dibatalkan',
    skipped: 'Dilewati'
  },

  // Tweaks
  tweaks: {
    title: 'Tweaks, Pemeliharaan & System Cleaner',
    subtitle: 'Optimalkan Windows barumu agar enteng, bersih, dan siap tempur.',
    cleanTemp: 'Bersihkan Cache & File Temp',
    cleanTempDesc: 'Hapus file temporary %TEMP%, cache update, prefetch, dan kosongkan Recycle Bin.',
    hibernationOn: 'Aktifkan Hibernasi',
    hibernationOff: 'Matikan Hibernasi (Hemat Ruang C:)',
    eventLogClear: 'Hapus Semua Log Event Viewer',
    eventLogDesc: 'Bersihkan jejak log System, Application, Security & Setup.',
    wuDisable: 'Matikan Windows Update',
    wuEnable: 'Aktifkan Windows Update',
    sfcTitle: 'System File Checker (SFC Scan)',
    sfcDesc: 'Pindai dan perbaiki otomatis integritas file sistem Windows yang rusak (sfc /scannow).',
    dismTitle: 'DISM Health Restore',
    dismDesc: 'Perbaiki Windows Component Store langsung dari image resmi Microsoft.',
    addUserTitle: 'Tambah Akun Pengguna Baru',
    addUserDesc: 'Buat akun Windows baru dan otomatis tambahkan ke grup Administrator.',
    diskCleanupTitle: 'Buka Windows Disk Cleanup',
    sysinfoTitle: 'Laporan Informasi Sistem Lengkap',
    riskyWarning: 'Aksi ini berisiko! Yakin ingin melanjutkan?'
  },

  // Logs
  logsTitle: 'Log Terminal Real-time',
  copyLogs: 'Salin Log',
  saveLogs: 'Simpan ke File',
  clearLogs: 'Bersihkan Layar',
  copiedSuccess: 'Log disalin ke clipboard!',

  // Winget Guide Modal
  wingetGuideTitle: 'Panduan Pasang App Installer (winget)',
  wingetGuideText:
    'Komputer kamu belum memiliki winget. Pasang "App Installer" resmi dari Microsoft Store atau download release MSIX dari GitHub microsoft/winget-cli.',
  openStoreLink: 'Buka Microsoft Store',
  openGithubWinget: 'Buka GitHub Winget'
};
