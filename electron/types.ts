export type AppSource = 'winget' | 'github-release';

export type InstallType = 'winget' | 'msi' | 'exe';

export type AppCategory =
  | 'Browser'
  | 'IDE & Editor'
  | 'Dev Tools'
  | 'Server & DB'
  | 'Office & Desain'
  | 'Utilities'
  | 'Sosmed'
  | 'Media'
  | 'Gaming'
  | 'Drivers & Runtimes'
  | 'Creative (ArtCraft)'
  | 'Tweaks';

export interface DeviceInfo {
  instanceId: string;
  name: string;
  deviceClass: string;
  status: 'OK' | 'Driver Hilang' | 'Bermasalah';
  rawStatus: string;
  errorCode: number;
  hardwareIds: string[];
  suggestedSource: string;
}

export interface HardwareSummary {
  manufacturer: string;
  model: string;
  baseBoard: string;
  gpus: string[];
  gpuVendor: 'NVIDIA' | 'AMD' | 'Intel' | 'Multiple' | 'Unknown';
  networkAdapters: string[];
  soundDevices: string[];
  problemCount: number;
}

export interface WindowsUpdateDriver {
  id: string;
  title: string;
  description: string;
  kbArticleIds: string[];
  sizeMB?: number;
}

export interface DriverCenterScanResult {
  hardware: HardwareSummary;
  devices: DeviceInfo[];
  windowsUpdateDrivers: WindowsUpdateDriver[];
  oemTool?: {
    name: string;
    wingetId?: string;
    url?: string;
  };
  gpuTools: {
    name: string;
    wingetId?: string;
    url?: string;
  }[];
}

export interface AppItem {
  id: string;
  nama: string;
  kategori: AppCategory;
  deskripsi: string;
  ikon: string;
  source: AppSource;
  wingetId?: string;
  githubRepo?: string;
  assetPattern?: string;
  installType?: InstallType;
  silentArgs?: string[];
  websiteUrl?: string;
  customCommand?: string;
}

export interface PresetProfile {
  id: string;
  nama: string;
  deskripsi: string;
  appIds: string[];
  isCustom?: boolean;
}

export type AppInstallStatus =
  | 'idle'
  | 'queued'
  | 'downloading'
  | 'verifying'
  | 'installing'
  | 'completed'
  | 'failed'
  | 'cancelled'
  | 'skipped';

export interface InstallProgress {
  appId: string;
  status: AppInstallStatus;
  percentage: number;
  downloadSpeedMBps?: number;
  etaSeconds?: number;
  downloadedBytes?: number;
  totalBytes?: number;
  message?: string;
  error?: string;
}

export interface SystemStatus {
  isAdmin: boolean;
  hasWinget: boolean;
  wingetVersion?: string;
  hasInternet: boolean;
  osVersion: string;
  osArch: string;
  computerName: string;
  userName: string;
  diskFreeGB: number;
  diskTotalGB: number;
}

export interface InstalledAppInfo {
  installed: boolean;
  version?: string;
  hasUpdate?: boolean;
}

export interface AppConfig {
  maxParallel: number;
  skipAlreadyInstalled: boolean;
  theme: 'hacker-dark';
  autoRetryCount: number;
  viewMode?: 'grid' | 'list';
}

export interface TweakResult {
  success: boolean;
  output: string;
  error?: string;
}
