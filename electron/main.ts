import { app, BrowserWindow, ipcMain, shell, dialog } from 'electron';
import path from 'path';
import fs from 'fs';
import { logger } from './modules/logger';
import { configManager } from './modules/config';
import { checkIsAdmin, getSystemStatus } from './modules/sysinfo';
import { spawn } from 'child_process';
import { detectInstalledApps } from './modules/detector';
import { installerQueue } from './modules/installerQueue';
import {
  cleanTempCache,
  toggleHibernation,
  clearEventLogs,
  toggleWindowsUpdate,
  runSfc,
  runDism,
  addNewUser,
  runDiskCleanup,
  getSystemInfoReport
} from './modules/tweaks';
import {
  scanAllDriverCenter,
  createSystemRestorePoint,
  backupInstalledDrivers,
  installWindowsUpdateDrivers,
  generateDeviceReportText
} from './modules/drivers';
import { AppItem, PresetProfile } from './types';

let mainWindow: BrowserWindow | null = null;

function getResourcePath(relativePath: string): string {
  if (app.isPackaged) {
    return path.join(process.resourcesPath, relativePath);
  }
  return path.join(__dirname, '..', relativePath);
}

function getAppIconPath(): string {
  const candidatePaths = [
    path.join(__dirname, '../build/icon.ico'),
    path.join(process.cwd(), 'build', 'icon.ico'),
    path.join(__dirname, '../public/favicon.ico'),
    path.join(process.cwd(), 'public', 'favicon.ico')
  ];
  for (const p of candidatePaths) {
    if (fs.existsSync(p)) return p;
  }
  return '';
}

function loadAppsData(): AppItem[] {
  try {
    const candidatePaths = [
      path.join(app.getAppPath(), 'apps.json'),
      path.join(process.cwd(), 'apps.json'),
      getResourcePath('apps.json'),
      path.join(__dirname, '..', 'apps.json')
    ];

    for (const p of candidatePaths) {
      if (fs.existsSync(p)) {
        return JSON.parse(fs.readFileSync(p, 'utf8'));
      }
    }
  } catch (err: any) {
    logger.error(`Gagal membaca apps.json: ${err.message}`);
  }
  return [];
}

function loadDefaultPresets(): PresetProfile[] {
  try {
    const candidatePaths = [
      path.join(app.getAppPath(), 'presets.json'),
      path.join(process.cwd(), 'presets.json'),
      getResourcePath('presets.json'),
      path.join(__dirname, '..', 'presets.json')
    ];

    for (const p of candidatePaths) {
      if (fs.existsSync(p)) {
        return JSON.parse(fs.readFileSync(p, 'utf8'));
      }
    }
  } catch (err: any) {
    logger.error(`Gagal membaca presets.json: ${err.message}`);
  }
  return [];
}

function createWindow() {
  const iconPath = getAppIconPath();

  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 1024,
    minHeight: 680,
    title: 'Kickstart - Fresh Windows, ready in minutes',
    icon: iconPath || undefined,
    backgroundColor: '#0c0e14',
    show: false,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  });

  installerQueue.setWindow(mainWindow);

  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
  });

  // Open external links in default OS browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  const isDev = process.env.VITE_DEV_SERVER_URL;
  if (isDev) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL!);
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
    installerQueue.setWindow(null);
  });
}

function relaunchAsAdmin() {
  if (process.platform === 'win32') {
    const exePath = process.execPath;
    const args = process.argv.slice(1).map((a) => `"${a}"`).join(' ');
    const psCommand = `Start-Process -FilePath "${exePath}" -ArgumentList '${args}' -Verb RunAs`;

    try {
      spawn('powershell.exe', ['-NoProfile', '-WindowStyle', 'Hidden', '-Command', psCommand], {
        detached: true,
        stdio: 'ignore'
      }).unref();
      app.quit();
    } catch (err: any) {
      logger.error(`Gagal meminta elevasi: ${err.message}`);
    }
  }
}

app.whenReady().then(async () => {
  logger.info('Kickstart dimulai. Menginisialisasi sistem...');

  // Auto-elevate: jika belum administrator dan aplikasi ter-pack
  if (process.platform === 'win32') {
    const isAdmin = await checkIsAdmin();
    if (!isAdmin && app.isPackaged) {
      logger.warn('Aplikasi belum memiliki hak Administrator. Meminta elevasi UAC...');
      relaunchAsAdmin();
      return;
    }
  }

  setupIpcHandlers();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

function setupIpcHandlers() {
  // Apps & Presets
  ipcMain.handle('apps:get', async () => {
    return loadAppsData();
  });

  ipcMain.handle('presets:get', async () => {
    const defaults = loadDefaultPresets();
    const custom = configManager.getCustomPresets();
    return [...defaults, ...custom];
  });

  ipcMain.handle('presets:saveCustom', async (_event, preset: PresetProfile) => {
    configManager.saveCustomPreset(preset);
    const defaults = loadDefaultPresets();
    const custom = configManager.getCustomPresets();
    return [...defaults, ...custom];
  });

  ipcMain.handle('presets:deleteCustom', async (_event, presetId: string) => {
    configManager.deleteCustomPreset(presetId);
    const defaults = loadDefaultPresets();
    const custom = configManager.getCustomPresets();
    return [...defaults, ...custom];
  });

  ipcMain.handle('presets:export', async (_event, presets: PresetProfile[]) => {
    if (!mainWindow) return { success: false };
    const { filePath } = await dialog.showSaveDialog(mainWindow, {
      title: 'Ekspor Profil Preset',
      defaultPath: 'kickstart-presets.json',
      filters: [{ name: 'JSON Files', extensions: ['json'] }]
    });

    if (filePath) {
      const ok = configManager.exportPresetsToFile(filePath, presets);
      return { success: ok, path: filePath };
    }
    return { success: false };
  });

  ipcMain.handle('presets:import', async () => {
    if (!mainWindow) return [];
    const { filePaths } = await dialog.showOpenDialog(mainWindow, {
      title: 'Impor Profil Preset',
      filters: [{ name: 'JSON Files', extensions: ['json'] }],
      properties: ['openFile']
    });

    if (filePaths.length > 0) {
      configManager.importPresetsFromFile(filePaths[0]);
    }
    const defaults = loadDefaultPresets();
    const custom = configManager.getCustomPresets();
    return [...defaults, ...custom];
  });

  // Config
  ipcMain.handle('config:get', async () => {
    return configManager.getConfig();
  });

  ipcMain.handle('config:save', async (_event, partial) => {
    return configManager.saveConfig(partial);
  });

  // System Diagnostics
  ipcMain.handle('system:status', async () => {
    return await getSystemStatus();
  });

  ipcMain.handle('system:relaunchAdmin', async () => {
    relaunchAsAdmin();
  });

  ipcMain.handle('system:detectInstalled', async (_event, forceRefresh: boolean = false) => {
    const apps = loadAppsData();
    return await detectInstalledApps(apps, forceRefresh);
  });

  // Driver Center Handlers
  ipcMain.handle('drivers:scan', async () => {
    return await scanAllDriverCenter();
  });

  ipcMain.handle('drivers:createRestorePoint', async (_event, desc?: string) => {
    return await createSystemRestorePoint(desc || 'Kickstart Driver Install');
  });

  ipcMain.handle('drivers:backup', async () => {
    if (!mainWindow) return { success: false, message: 'Window tidak tersedia' };
    const { filePaths } = await dialog.showOpenDialog(mainWindow, {
      title: 'Pilih Folder Tujuan Backup Driver',
      properties: ['openDirectory', 'createDirectory']
    });

    if (filePaths && filePaths.length > 0) {
      return await backupInstalledDrivers(filePaths[0]);
    }
    return { success: false, message: 'Pemilihan folder dibatalkan.' };
  });

  ipcMain.handle('drivers:installWindowsUpdate', async (_event, updateIds: string[]) => {
    return await installWindowsUpdateDrivers(updateIds, (text) => {
      mainWindow?.webContents.send('tweak:output', text);
    });
  });

  ipcMain.handle('drivers:copyReport', async (_event, scanResult: any) => {
    return generateDeviceReportText(scanResult);
  });

  ipcMain.handle('system:restartNow', async () => {
    spawn('shutdown.exe', ['/r', '/t', '5'], { detached: true, stdio: 'ignore' }).unref();
  });

  // Queue
  ipcMain.handle('queue:start', async (_event, appIds: string[], installedMap: Record<string, boolean> = {}) => {
    const allApps = loadAppsData();
    const targetApps = appIds
      .map((id) => allApps.find((a) => a.id === id))
      .filter((a): a is AppItem => Boolean(a));

    // Run queue in background
    installerQueue.startQueue(targetApps, installedMap);
  });

  ipcMain.handle('queue:cancelApp', async (_event, appId: string) => {
    installerQueue.cancelApp(appId);
  });

  ipcMain.handle('queue:cancelAll', async () => {
    installerQueue.cancelAll();
  });

  // Tweaks & Cleaner
  ipcMain.handle('tweaks:run', async (_event, tweakId: string, params: Record<string, any> = {}) => {
    const sendOutput = (chunk: string) => {
      mainWindow?.webContents.send('tweak:output', chunk);
    };

    switch (tweakId) {
      case 'cleaner':
        return await cleanTempCache(sendOutput);
      case 'hibernation_on':
        return await toggleHibernation(true, sendOutput);
      case 'hibernation_off':
        return await toggleHibernation(false, sendOutput);
      case 'eventlog':
        return await clearEventLogs(sendOutput);
      case 'windows_update_off':
        return await toggleWindowsUpdate(false, sendOutput);
      case 'windows_update_on':
        return await toggleWindowsUpdate(true, sendOutput);
      case 'sfc':
        return await runSfc(sendOutput);
      case 'dism':
        return await runDism(sendOutput);
      case 'adduser':
        return await addNewUser(params.username || '', params.password || '', params.makeAdmin !== false, sendOutput);
      case 'diskcleanup':
        return await runDiskCleanup(params.drive || 'C', sendOutput);
      case 'sysinfo':
        return await getSystemInfoReport(sendOutput);
      default:
        return { success: false, output: '', error: `Tweak "${tweakId}" tidak dikenali.` };
    }
  });

  // Shell & Logs
  ipcMain.handle('shell:openExternal', async (_event, url: string) => {
    // Only allow http & https protocols for security
    if (url.startsWith('https://') || url.startsWith('http://')) {
      await shell.openExternal(url);
    }
  });

  ipcMain.handle('logs:get', async () => {
    return logger.getRecentLogs();
  });

  ipcMain.handle('logs:saveToFile', async () => {
    if (!mainWindow) return { success: false };
    const { filePath } = await dialog.showSaveDialog(mainWindow, {
      title: 'Simpan File Log',
      defaultPath: `kickstart-log-${Date.now()}.txt`,
      filters: [{ name: 'Log / Text Files', extensions: ['txt', 'log'] }]
    });

    if (filePath) {
      try {
        fs.writeFileSync(filePath, logger.getAllLogContent(), 'utf8');
        return { success: true, path: filePath };
      } catch (err: any) {
        logger.error(`Gagal menyimpan file log: ${err.message}`);
        return { success: false };
      }
    }
    return { success: false };
  });
}
