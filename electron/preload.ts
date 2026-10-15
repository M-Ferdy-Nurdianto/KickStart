import { contextBridge, ipcRenderer } from 'electron';
import { AppConfig, AppItem, InstalledAppInfo, InstallProgress, PresetProfile, SystemStatus, TweakResult } from './types';

export interface KickstartAPI {
  // Apps & Presets
  getApps: () => Promise<AppItem[]>;
  getPresets: () => Promise<PresetProfile[]>;
  saveCustomPreset: (preset: PresetProfile) => Promise<PresetProfile[]>;
  deleteCustomPreset: (presetId: string) => Promise<PresetProfile[]>;
  exportPresets: (presets: PresetProfile[]) => Promise<{ success: boolean; path?: string }>;
  importPresets: () => Promise<PresetProfile[]>;

  // System & Detection
  getSystemStatus: () => Promise<SystemStatus>;
  relaunchAsAdmin: () => Promise<void>;
  checkInstalledApps: (forceRefresh?: boolean) => Promise<Record<string, InstalledAppInfo>>;
  getConfig: () => Promise<AppConfig>;
  saveConfig: (config: Partial<AppConfig>) => Promise<AppConfig>;

  // Installation Queue
  startInstallQueue: (appIds: string[], installedMap?: Record<string, boolean>) => Promise<void>;
  cancelApp: (appId: string) => Promise<void>;
  cancelAll: () => Promise<void>;

  // Tweaks
  runTweak: (tweakId: string, params?: Record<string, any>) => Promise<TweakResult>;

  // Driver Center
  scanDrivers: () => Promise<any>;
  createRestorePoint: (desc?: string) => Promise<{ success: boolean; message: string }>;
  backupDrivers: () => Promise<{ success: boolean; message: string; path?: string }>;
  installWindowsUpdateDrivers: (updateIds: string[]) => Promise<{ success: boolean; needsRestart: boolean; message: string }>;
  copyDeviceReport: (scanResult: any) => Promise<string>;
  restartNow: () => Promise<void>;

  // Utility
  openExternal: (url: string) => Promise<void>;
  getLogs: () => Promise<string[]>;
  saveLogsToFile: () => Promise<{ success: boolean; path?: string }>;

  // Event Listeners
  onInstallProgress: (callback: (progress: InstallProgress) => void) => () => void;
  onLogEntry: (callback: (line: string) => void) => () => void;
  onQueueFinished: (callback: (summary: any) => void) => () => void;
  onTweakOutput: (callback: (output: string) => void) => () => void;
}

const api: KickstartAPI = {
  getApps: () => ipcRenderer.invoke('apps:get'),
  getPresets: () => ipcRenderer.invoke('presets:get'),
  saveCustomPreset: (preset) => ipcRenderer.invoke('presets:saveCustom', preset),
  deleteCustomPreset: (presetId) => ipcRenderer.invoke('presets:deleteCustom', presetId),
  exportPresets: (presets) => ipcRenderer.invoke('presets:export', presets),
  importPresets: () => ipcRenderer.invoke('presets:import'),

  getSystemStatus: () => ipcRenderer.invoke('system:status'),
  relaunchAsAdmin: () => ipcRenderer.invoke('system:relaunchAdmin'),
  checkInstalledApps: (forceRefresh) => ipcRenderer.invoke('system:detectInstalled', forceRefresh),
  getConfig: () => ipcRenderer.invoke('config:get'),
  saveConfig: (config) => ipcRenderer.invoke('config:save', config),

  startInstallQueue: (appIds, installedMap) => ipcRenderer.invoke('queue:start', appIds, installedMap),
  cancelApp: (appId) => ipcRenderer.invoke('queue:cancelApp', appId),
  cancelAll: () => ipcRenderer.invoke('queue:cancelAll'),

  runTweak: (tweakId, params) => ipcRenderer.invoke('tweaks:run', tweakId, params),

  scanDrivers: () => ipcRenderer.invoke('drivers:scan'),
  createRestorePoint: (desc) => ipcRenderer.invoke('drivers:createRestorePoint', desc),
  backupDrivers: () => ipcRenderer.invoke('drivers:backup'),
  installWindowsUpdateDrivers: (updateIds) => ipcRenderer.invoke('drivers:installWindowsUpdate', updateIds),
  copyDeviceReport: (scanResult) => ipcRenderer.invoke('drivers:copyReport', scanResult),
  restartNow: () => ipcRenderer.invoke('system:restartNow'),

  openExternal: (url) => ipcRenderer.invoke('shell:openExternal', url),
  getLogs: () => ipcRenderer.invoke('logs:get'),
  saveLogsToFile: () => ipcRenderer.invoke('logs:saveToFile'),

  onInstallProgress: (callback) => {
    const handler = (_event: any, data: InstallProgress) => callback(data);
    ipcRenderer.on('install:progress', handler);
    return () => ipcRenderer.removeListener('install:progress', handler);
  },

  onLogEntry: (callback) => {
    const handler = (_event: any, line: string) => callback(line);
    ipcRenderer.on('log:entry', handler);
    return () => ipcRenderer.removeListener('log:entry', handler);
  },

  onQueueFinished: (callback) => {
    const handler = (_event: any, summary: any) => callback(summary);
    ipcRenderer.on('queue:finished', handler);
    return () => ipcRenderer.removeListener('queue:finished', handler);
  },

  onTweakOutput: (callback) => {
    const handler = (_event: any, text: string) => callback(text);
    ipcRenderer.on('tweak:output', handler);
    return () => ipcRenderer.removeListener('tweak:output', handler);
  }
};

contextBridge.exposeInMainWorld('api', api);
