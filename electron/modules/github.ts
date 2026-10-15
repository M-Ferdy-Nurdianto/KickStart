import fs from 'fs';
import path from 'path';
import os from 'os';
import crypto from 'crypto';
import { spawn } from 'child_process';
import { AppItem, InstallProgress } from '../types';
import { logger } from './logger';

export interface GitHubAsset {
  name: string;
  browser_download_url: string;
  size: number;
  digest?: string; // e.g. "sha256:..."
  content_type?: string;
}

export interface GitHubRelease {
  tag_name: string;
  name: string;
  assets: GitHubAsset[];
  html_url: string;
}

// In-memory cache for GitHub API responses to prevent hitting 60 req/hour rate limit
const apiCache: Map<string, { data: any; timestamp: number }> = new Map();
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

/**
 * Fetches latest release for a repository with in-memory caching and rate limit handling.
 */
export async function fetchLatestRelease(repo: string): Promise<GitHubRelease> {
  const cacheKey = `release_${repo}`;
  const cached = apiCache.get(cacheKey);
  const now = Date.now();

  if (cached && now - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }

  const url = `https://api.github.com/repos/${repo}/releases/latest`;
  logger.info(`Mengambil rilis GitHub dari: ${url}`);

  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Kickstart-PostInstaller',
      Accept: 'application/vnd.github.v3+json'
    }
  });

  if (res.status === 403 || res.status === 429) {
    const rateLimitRemaining = res.headers.get('x-ratelimit-remaining');
    if (rateLimitRemaining === '0') {
      const resetTime = res.headers.get('x-ratelimit-reset');
      const resetDate = resetTime ? new Date(parseInt(resetTime, 10) * 1000).toLocaleTimeString() : 'nanti';
      throw new Error(`Batas GitHub API (Rate Limit) tercapai (60 req/jam). Coba lagi jam ${resetDate} atau gunakan winget.`);
    }
  }

  if (!res.ok) {
    throw new Error(`Gagal mengambil rilis dari GitHub (${res.status} ${res.statusText})`);
  }

  const data = (await res.json()) as GitHubRelease;
  apiCache.set(cacheKey, { data, timestamp: now });
  return data;
}

/**
 * Pure function to automatically pick the best Windows installer asset from GitHub release assets.
 * Selects MSI or EXE matching architecture (x64, arm64).
 */
export function selectGitHubAsset(
  assets: GitHubAsset[],
  arch: string = process.arch,
  customPattern?: string
): { asset: GitHubAsset; installType: 'msi' | 'exe' } | null {
  if (!assets || assets.length === 0) return null;

  // Filter out non-installer formats (zip, tar, dmg, AppImage, deb, rpm, txt, sums)
  const isWindowsInstaller = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.endsWith('.zip') || lower.endsWith('.tar.gz') || lower.endsWith('.dmg') || lower.endsWith('.appimage')) {
      return false;
    }
    if (lower.endsWith('.txt') || lower.endsWith('.deb') || lower.endsWith('.rpm')) {
      return false;
    }
    return lower.endsWith('.msi') || lower.endsWith('.exe');
  };

  const installerCandidates = assets.filter((a) => isWindowsInstaller(a.name));

  // If custom pattern provided, test matching first
  if (customPattern) {
    try {
      const regex = new RegExp(customPattern, 'i');
      const match = installerCandidates.find((a) => regex.test(a.name));
      if (match) {
        return {
          asset: match,
          installType: match.name.toLowerCase().endsWith('.msi') ? 'msi' : 'exe'
        };
      }
    } catch (e) {
      logger.warn(`Custom asset pattern regex invalid: ${customPattern}`);
    }
  }

  const isArm = arch === 'arm64';

  // 1. Prioritize MSI for the target architecture
  const msiMatch = installerCandidates.find((a) => {
    const lower = a.name.toLowerCase();
    if (!lower.endsWith('.msi')) return false;
    if (isArm) return lower.includes('arm64') || lower.includes('aarch64');
    return lower.includes('x64') || lower.includes('x86_64') || (!lower.includes('arm64') && !lower.includes('x86'));
  });

  if (msiMatch) {
    return { asset: msiMatch, installType: 'msi' };
  }

  // 2. Prioritize EXE for target architecture
  const exeMatch = installerCandidates.find((a) => {
    const lower = a.name.toLowerCase();
    if (!lower.endsWith('.exe')) return false;
    if (isArm) return lower.includes('arm64') || lower.includes('aarch64');
    return lower.includes('x64') || lower.includes('x86_64') || (!lower.includes('arm64') && !lower.includes('x86'));
  });

  if (exeMatch) {
    return { asset: exeMatch, installType: 'exe' };
  }

  // 3. Any MSI installer
  const anyMsi = installerCandidates.find((a) => a.name.toLowerCase().endsWith('.msi'));
  if (anyMsi) {
    return { asset: anyMsi, installType: 'msi' };
  }

  // 4. Any EXE installer
  const anyExe = installerCandidates.find((a) => a.name.toLowerCase().endsWith('.exe'));
  if (anyExe) {
    return { asset: anyExe, installType: 'exe' };
  }

  return null;
}

/**
 * Computes sha256 hash of a file on disk.
 */
export async function computeFileHash(filePath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash('sha256');
    const stream = fs.createReadStream(filePath);
    stream.on('data', (chunk) => hash.update(chunk));
    stream.on('end', () => resolve(hash.digest('hex').toLowerCase()));
    stream.on('error', (err) => reject(err));
  });
}

export interface GitHubDownloadOptions {
  onProgress?: (p: Partial<InstallProgress>) => void;
  onLog?: (line: string) => void;
  abortSignal?: AbortSignal;
  maxRetries?: number;
}

/**
 * Downloads an asset to %TEMP%/Kickstart/downloads with progress, speed, ETA, and auto-retry.
 */
export async function downloadAssetWithRetry(
  asset: GitHubAsset,
  app: AppItem,
  options: GitHubDownloadOptions = {}
): Promise<string> {
  const downloadDir = path.join(os.tmpdir(), 'Kickstart', 'downloads');
  if (!fs.existsSync(downloadDir)) {
    fs.mkdirSync(downloadDir, { recursive: true });
  }

  const safeFilename = asset.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const targetPath = path.join(downloadDir, safeFilename);

  const maxRetries = options.maxRetries ?? 3;
  let attempt = 0;

  while (attempt < maxRetries) {
    attempt++;
    try {
      if (options.abortSignal?.aborted) {
        throw new Error('Unduhan dibatalkan oleh pengguna');
      }

      options.onLog?.(
        `[DOWNLOAD] Mengunduh ${asset.name} (Percobaan ${attempt}/${maxRetries})...`
      );

      await downloadStream(asset.browser_download_url, targetPath, asset.size, app.id, options);
      return targetPath;
    } catch (err: any) {
      if (options.abortSignal?.aborted) {
        // Clean up partial file
        if (fs.existsSync(targetPath)) {
          try {
            fs.unlinkSync(targetPath);
          } catch {}
        }
        throw err;
      }

      logger.warn(`Download attempt ${attempt} failed: ${err.message}`);
      options.onLog?.(`[DOWNLOAD ERROR] ${err.message}. Mencoba ulang...`);

      if (attempt >= maxRetries) {
        throw new Error(`Gagal mengunduh setelah ${maxRetries} percobaan: ${err.message}`);
      }

      // Exponential backoff
      await new Promise((r) => setTimeout(r, 1500 * attempt));
    }
  }

  throw new Error('Gagal mengunduh aset.');
}

/**
 * Performs actual streaming download with speed, progress, and ETA calculation.
 */
async function downloadStream(
  url: string,
  destPath: string,
  totalSize: number,
  appId: string,
  options: GitHubDownloadOptions
): Promise<void> {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Kickstart-PostInstaller' },
    signal: options.abortSignal
  });

  if (!res.ok) {
    throw new Error(`HTTP ${res.status} ${res.statusText}`);
  }

  const contentLengthHeader = res.headers.get('content-length');
  const totalBytes = contentLengthHeader ? parseInt(contentLengthHeader, 10) : totalSize;

  const fileStream = fs.createWriteStream(destPath);

  if (!res.body) {
    throw new Error('Respon stream kosong dari server');
  }

  const reader = res.body.getReader();
  let downloadedBytes = 0;
  let lastTime = Date.now();
  let lastBytes = 0;

  while (true) {
    if (options.abortSignal?.aborted) {
      fileStream.close();
      throw new Error('Unduhan dibatalkan');
    }

    const { done, value } = await reader.read();
    if (done) break;

    if (value) {
      fileStream.write(Buffer.from(value));
      downloadedBytes += value.length;

      const now = Date.now();
      const elapsedSec = (now - lastTime) / 1000;

      // Update progress every 300ms
      if (elapsedSec >= 0.3) {
        const bytesChunk = downloadedBytes - lastBytes;
        const speedMBps = Math.round((bytesChunk / (1024 * 1024) / elapsedSec) * 100) / 100;
        const percentage = totalBytes > 0 ? Math.round((downloadedBytes / totalBytes) * 100) : 0;
        const remainingBytes = Math.max(0, totalBytes - downloadedBytes);
        const etaSeconds = speedMBps > 0 ? Math.round(remainingBytes / (speedMBps * 1024 * 1024)) : 0;

        options.onProgress?.({
          appId,
          status: 'downloading',
          percentage,
          downloadedBytes,
          totalBytes,
          downloadSpeedMBps: speedMBps,
          etaSeconds,
          message: `Mengunduh... ${speedMBps} MB/s (Sisa ~${etaSeconds}s)`
        });

        lastTime = now;
        lastBytes = downloadedBytes;
      }
    }
  }

  await new Promise<void>((resolve, reject) => {
    fileStream.end(() => resolve());
    fileStream.on('error', reject);
  });
}

/**
 * Installs downloaded file silently using msiexec for MSI or silent flags for EXE.
 */
export async function installDownloadedFile(
  filePath: string,
  installType: 'msi' | 'exe',
  app: AppItem,
  options: {
    onProgress?: (p: Partial<InstallProgress>) => void;
    onLog?: (line: string) => void;
    abortSignal?: AbortSignal;
  } = {}
): Promise<{ success: boolean; exitCode: number; message: string }> {
  return new Promise((resolve) => {
    let command: string;
    let args: string[];

    if (installType === 'msi') {
      command = 'msiexec.exe';
      args = ['/i', filePath, '/qn', '/norestart'];
    } else {
      command = filePath;
      args = app.silentArgs || ['/VERYSILENT', '/NORESTART', '/ALLUSERS'];
    }

    logger.info(`Memasang: ${command} ${args.join(' ')}`);
    options.onLog?.(`[INSTALL] Menjalankan: ${command} ${args.join(' ')}`);

    options.onProgress?.({
      appId: app.id,
      status: 'installing',
      percentage: 95,
      message: 'Sedang memasang ke sistem Windows...'
    });

    const proc = spawn(command, args, {
      windowsHide: true,
      stdio: ['ignore', 'pipe', 'pipe']
    });

    if (options.abortSignal) {
      options.abortSignal.addEventListener('abort', () => {
        if (!proc.killed) {
          try {
            spawn('taskkill', ['/pid', String(proc.pid), '/f', '/t'], { windowsHide: true });
          } catch {
            proc.kill();
          }
        }
        resolve({ success: false, exitCode: -999, message: 'Dibatalkan' });
      });
    }

    proc.on('close', (code) => {
      const exitCode = code ?? -1;
      logger.info(`Installer ${app.nama} selesai dengan exit code: ${exitCode}`);
      options.onLog?.(`[INSTALL] Exit code: ${exitCode}`);

      // Exit codes 0 and 3010 (restart required) are considered successful
      if (exitCode === 0 || exitCode === 3010) {
        options.onProgress?.({
          appId: app.id,
          status: 'completed',
          percentage: 100,
          message: exitCode === 3010 ? 'Selesai (perlu restart)' : 'Berhasil diinstal!'
        });
        resolve({
          success: true,
          exitCode,
          message: exitCode === 3010 ? 'Selesai (perlu restart)' : 'Berhasil diinstal'
        });
      } else {
        const errMsg = `Gagal instalasi dengan kode keluar ${exitCode}`;
        options.onProgress?.({
          appId: app.id,
          status: 'failed',
          percentage: 95,
          error: errMsg
        });
        resolve({ success: false, exitCode, message: errMsg });
      }
    });

    proc.on('error', (err) => {
      logger.error(`Error spawn installer: ${err.message}`);
      resolve({ success: false, exitCode: -1, message: err.message });
    });
  });
}

/**
 * Full orchestrator for GitHub Release application installation.
 */
export async function installGitHubReleaseApp(
  app: AppItem,
  options: {
    onProgress?: (p: Partial<InstallProgress>) => void;
    onLog?: (line: string) => void;
    abortSignal?: AbortSignal;
    arch?: string;
  } = {}
): Promise<{ success: boolean; exitCode: number; message: string }> {
  try {
    if (!app.githubRepo) {
      throw new Error(`Aplikasi ${app.nama} tidak memiliki repository GitHub`);
    }

    options.onProgress?.({
      appId: app.id,
      status: 'downloading',
      percentage: 5,
      message: 'Mengecek rilis terbaru di GitHub...'
    });

    // 1. Fetch release
    const release = await fetchLatestRelease(app.githubRepo);
    options.onLog?.(`[GITHUB] Rilis terbaru: ${release.tag_name} (${release.assets.length} aset)`);

    // 2. Select asset
    const selected = selectGitHubAsset(release.assets, options.arch || process.arch, app.assetPattern);
    if (!selected) {
      throw new Error(`Tidak ditemukan file installer Windows yang cocok di rilis ${release.tag_name}`);
    }

    options.onLog?.(`[GITHUB] Aset terpilih: ${selected.asset.name} (${selected.installType.toUpperCase()})`);

    // 3. Download asset
    const downloadedFilePath = await downloadAssetWithRetry(selected.asset, app, {
      onProgress: options.onProgress,
      onLog: options.onLog,
      abortSignal: options.abortSignal
    });

    // 4. Verify integrity if digest is available
    if (selected.asset.digest && selected.asset.digest.startsWith('sha256:')) {
      options.onProgress?.({
        appId: app.id,
        status: 'verifying',
        percentage: 90,
        message: 'Memverifikasi checksum SHA-256...'
      });
      options.onLog?.(`[VERIFY] Memeriksa checksum hash SHA-256...`);

      const expectedHash = selected.asset.digest.replace('sha256:', '').trim().toLowerCase();
      const actualHash = await computeFileHash(downloadedFilePath);

      if (expectedHash !== actualHash) {
        // Integrity check failed!
        try {
          fs.unlinkSync(downloadedFilePath);
        } catch {}
        const mismatchErr = `Verifikasi integritas gagal! SHA-256 tidak cocok (Expected: ${expectedHash}, Actual: ${actualHash})`;
        logger.error(mismatchErr);
        throw new Error(mismatchErr);
      }
      options.onLog?.(`[VERIFY] Hash SHA-256 valid: ${actualHash}`);
    }

    // 5. Run silent installer
    return await installDownloadedFile(downloadedFilePath, selected.installType, app, {
      onProgress: options.onProgress,
      onLog: options.onLog,
      abortSignal: options.abortSignal
    });
  } catch (err: any) {
    logger.error(`Error install GitHub release app ${app.nama}: ${err.message}`);
    options.onProgress?.({
      appId: app.id,
      status: 'failed',
      error: err.message
    });
    return { success: false, exitCode: -1, message: err.message };
  }
}
