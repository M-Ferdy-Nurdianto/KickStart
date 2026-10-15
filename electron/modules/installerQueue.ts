import { BrowserWindow } from 'electron';
import { AppItem, InstallProgress, AppInstallStatus } from '../types';
import { installWithWinget } from './winget';
import { installGitHubReleaseApp } from './github';
import { logger } from './logger';
import { configManager } from './config';

export interface QueueSummary {
  total: number;
  completed: number;
  failed: number;
  skipped: number;
  cancelled: number;
  failedAppIds: string[];
}

export class InstallerQueue {
  private queue: AppItem[] = [];
  private activeJobs: Map<string, AbortController> = new Map();
  private progressMap: Map<string, InstallProgress> = new Map();
  private isRunning = false;
  private isCancelledAll = false;
  private window: BrowserWindow | null = null;
  private summary: QueueSummary = {
    total: 0,
    completed: 0,
    failed: 0,
    skipped: 0,
    cancelled: 0,
    failedAppIds: []
  };

  public setWindow(win: BrowserWindow | null) {
    this.window = win;
  }

  public getProgressMap(): Record<string, InstallProgress> {
    const obj: Record<string, InstallProgress> = {};
    for (const [k, v] of this.progressMap.entries()) {
      obj[k] = v;
    }
    return obj;
  }

  public getSummary(): QueueSummary {
    return { ...this.summary };
  }

  public async startQueue(apps: AppItem[], installedMap: Record<string, boolean> = {}) {
    if (this.isRunning) {
      logger.warn('Antrian instalasi sedang berjalan.');
      return;
    }

    this.isRunning = true;
    this.isCancelledAll = false;
    this.queue = [...apps];
    this.activeJobs.clear();
    this.progressMap.clear();

    const config = configManager.getConfig();

    this.summary = {
      total: apps.length,
      completed: 0,
      failed: 0,
      skipped: 0,
      cancelled: 0,
      failedAppIds: []
    };

    logger.info(`Memulai antrian instalasi (${apps.length} aplikasi, paralel: ${config.maxParallel})...`);

    // Initialize all to queued or skipped
    for (const app of apps) {
      if (config.skipAlreadyInstalled && installedMap[app.id]) {
        this.progressMap.set(app.id, {
          appId: app.id,
          status: 'skipped',
          percentage: 100,
          message: 'Dilewati (sudah terinstal)'
        });
        this.summary.skipped++;
      } else {
        this.progressMap.set(app.id, {
          appId: app.id,
          status: 'queued',
          percentage: 0,
          message: 'Menunggu antrian...'
        });
      }
      this.notifyProgress(app.id);
    }

    // Filter out skipped apps from active execution queue
    const pendingApps = this.queue.filter(
      (app) => this.progressMap.get(app.id)?.status === 'queued'
    );

    // Process with pool concurrency limit
    const maxConcurrency = Math.max(1, config.maxParallel || 2);
    let index = 0;

    const worker = async () => {
      while (index < pendingApps.length && !this.isCancelledAll) {
        const app = pendingApps[index++];
        if (!app) break;
        await this.processApp(app);
      }
    };

    const workers = [];
    for (let i = 0; i < maxConcurrency; i++) {
      workers.push(worker());
    }

    await Promise.all(workers);

    this.isRunning = false;
    logger.info(
      `Antrian selesai. Berhasil: ${this.summary.completed}, Gagal: ${this.summary.failed}, Dilewati: ${this.summary.skipped}, Batal: ${this.summary.cancelled}`
    );

    if (this.window && !this.window.isDestroyed()) {
      this.window.webContents.send('queue:finished', this.summary);
    }
  }

  private async processApp(app: AppItem) {
    if (this.isCancelledAll) {
      this.updateStatus(app.id, 'cancelled', 0, 'Dibatalkan');
      this.summary.cancelled++;
      return;
    }

    const abortController = new AbortController();
    this.activeJobs.set(app.id, abortController);

    this.updateStatus(app.id, 'downloading', 0, 'Mempersiapkan instalasi...');

    const onProgress = (p: Partial<InstallProgress>) => {
      const current = this.progressMap.get(app.id) || {
        appId: app.id,
        status: 'downloading',
        percentage: 0
      };
      this.progressMap.set(app.id, { ...current, ...p });
      this.notifyProgress(app.id);
    };

    const onLog = (line: string) => {
      if (this.window && !this.window.isDestroyed()) {
        this.window.webContents.send('log:entry', line);
      }
    };

    let result: { success: boolean; exitCode: number; message: string };

    try {
      if (app.source === 'github-release') {
        result = await installGitHubReleaseApp(app, {
          onProgress,
          onLog,
          abortSignal: abortController.signal
        });
      } else {
        result = await installWithWinget(app, {
          onProgress,
          onLog,
          abortSignal: abortController.signal
        });
      }

      this.activeJobs.delete(app.id);

      if (abortController.signal.aborted) {
        this.updateStatus(app.id, 'cancelled', 0, 'Dibatalkan oleh pengguna');
        this.summary.cancelled++;
      } else if (result.success) {
        this.updateStatus(app.id, 'completed', 100, result.message || 'Selesai');
        this.summary.completed++;
      } else {
        this.updateStatus(app.id, 'failed', 0, undefined, result.message || 'Gagal');
        this.summary.failed++;
        this.summary.failedAppIds.push(app.id);
      }
    } catch (err: any) {
      this.activeJobs.delete(app.id);
      this.updateStatus(app.id, 'failed', 0, undefined, err.message || 'Error tidak terduga');
      this.summary.failed++;
      this.summary.failedAppIds.push(app.id);
    }
  }

  public cancelApp(appId: string) {
    const controller = this.activeJobs.get(appId);
    if (controller) {
      controller.abort();
      this.activeJobs.delete(appId);
      this.updateStatus(appId, 'cancelled', 0, 'Dibatalkan oleh pengguna');
    } else {
      const p = this.progressMap.get(appId);
      if (p && p.status === 'queued') {
        this.updateStatus(appId, 'cancelled', 0, 'Dibatalkan sebelum mulai');
      }
    }
  }

  public cancelAll() {
    this.isCancelledAll = true;
    for (const [id, controller] of this.activeJobs.entries()) {
      controller.abort();
      this.updateStatus(id, 'cancelled', 0, 'Dibatalkan');
    }
    this.activeJobs.clear();

    for (const [id, p] of this.progressMap.entries()) {
      if (p.status === 'queued' || p.status === 'downloading' || p.status === 'installing') {
        this.updateStatus(id, 'cancelled', 0, 'Dibatalkan');
      }
    }
  }

  private updateStatus(
    appId: string,
    status: AppInstallStatus,
    percentage: number,
    message?: string,
    error?: string
  ) {
    this.progressMap.set(appId, {
      appId,
      status,
      percentage,
      message,
      error
    });
    this.notifyProgress(appId);
  }

  private notifyProgress(appId: string) {
    if (this.window && !this.window.isDestroyed()) {
      const p = this.progressMap.get(appId);
      if (p) {
        this.window.webContents.send('install:progress', p);
      }
    }
  }
}

export const installerQueue = new InstallerQueue();
