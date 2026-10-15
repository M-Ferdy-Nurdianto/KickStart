import { spawn, ChildProcess } from 'child_process';
import { AppItem, InstallProgress } from '../types';
import { logger } from './logger';

export interface WingetParseResult {
  status?: 'downloading' | 'verifying' | 'installing' | 'completed' | 'failed' | 'already_installed';
  percentage?: number;
  message?: string;
}

/**
 * Pure function to parse winget CLI console output chunk.
 * Designed for unit testing and reliable progress tracking.
 */
export function parseWingetOutput(chunk: string): WingetParseResult {
  const result: WingetParseResult = {};
  const text = chunk.trim();

  // Check for percentage (e.g., "45%" or " 45.2%")
  const percentMatch = text.match(/(\d+(?:\.\d+)?)\s*%/);
  if (percentMatch) {
    const p = parseFloat(percentMatch[1]);
    if (!isNaN(p) && p >= 0 && p <= 100) {
      result.percentage = Math.round(p);
    }
  }

  // Detect stage / state
  const lower = text.toLowerCase();

  if (
    lower.includes('berhasil diinstal') ||
    lower.includes('successfully installed') ||
    lower.includes('selesai')
  ) {
    result.status = 'completed';
    result.percentage = 100;
    result.message = 'Instalasi selesai!';
  } else if (
    lower.includes('sudah diinstal') ||
    lower.includes('already installed') ||
    lower.includes('0x8a150049')
  ) {
    result.status = 'already_installed';
    result.percentage = 100;
    result.message = 'Aplikasi sudah terinstal di sistem';
  } else if (
    lower.includes('gagal') ||
    lower.includes('failed') ||
    lower.includes('error:') ||
    lower.includes('kesalahan')
  ) {
    result.status = 'failed';
    result.message = text;
  } else if (
    lower.includes('menginstal') ||
    lower.includes('installing') ||
    lower.includes('memulai instalasi') ||
    lower.includes('starting package install')
  ) {
    result.status = 'installing';
    result.message = 'Sedang memasang paket ke sistem...';
  } else if (
    lower.includes('verifikasi hash') ||
    lower.includes('verified installer hash') ||
    lower.includes('verifying')
  ) {
    result.status = 'verifying';
    result.message = 'Memverifikasi integritas installer...';
  } else if (
    lower.includes('mengunduh') ||
    lower.includes('downloading') ||
    lower.includes('mb') ||
    lower.includes('kb')
  ) {
    result.status = 'downloading';
    result.message = 'Sedang mengunduh installer...';
  }

  return result;
}

export interface WingetInstallOptions {
  onProgress?: (progress: Partial<InstallProgress>) => void;
  onLog?: (line: string) => void;
  abortSignal?: AbortSignal;
}

/**
 * Executes winget install for a given app item with full error & progress handling.
 */
export async function installWithWinget(
  app: AppItem,
  options: WingetInstallOptions = {}
): Promise<{ success: boolean; exitCode: number; message: string }> {
  return new Promise((resolve) => {
    if (app.customCommand) {
      logger.info(`Menjalankan custom command untuk ${app.nama}: ${app.customCommand}`);
      options.onLog?.(`[COMMAND] Menjalankan: ${app.customCommand}`);
      options.onProgress?.({
        appId: app.id,
        status: 'installing',
        percentage: 30,
        message: `Memasang ${app.nama}...`
      });

      const parts = app.customCommand.split(' ');
      const cmd = parts[0];
      const cmdArgs = parts.slice(1);

      let customProc: ChildProcess | null = null;
      try {
        customProc = spawn(cmd, cmdArgs, {
          shell: true,
          windowsHide: true,
          stdio: ['ignore', 'pipe', 'pipe']
        });
      } catch (err: any) {
        logger.error(`Gagal spawn command ${app.customCommand}: ${err.message}`);
        return resolve({ success: false, exitCode: -1, message: err.message });
      }

      if (options.abortSignal) {
        options.abortSignal.addEventListener('abort', () => {
          if (customProc && !customProc.killed) {
            try {
              spawn('taskkill', ['/pid', String(customProc.pid), '/f', '/t'], { windowsHide: true });
            } catch {
              customProc.kill();
            }
          }
          resolve({ success: false, exitCode: -999, message: 'Dibatalkan' });
        });
      }

      customProc.stdout?.on('data', (d) => {
        const str = d.toString();
        options.onLog?.(`[OUTPUT] ${str}`);
      });
      customProc.stderr?.on('data', (d) => {
        const str = d.toString();
        options.onLog?.(`[OUTPUT] ${str}`);
      });

      customProc.on('close', (code) => {
        const exitCode = code ?? 0;
        if (exitCode === 0) {
          options.onProgress?.({
            appId: app.id,
            status: 'completed',
            percentage: 100,
            message: 'Berhasil dipasang!'
          });
          resolve({ success: true, exitCode: 0, message: 'Berhasil diinstal' });
        } else {
          options.onProgress?.({
            appId: app.id,
            status: 'failed',
            percentage: 0,
            error: `Keluar dengan kode ${exitCode}`
          });
          resolve({ success: false, exitCode, message: `Proses gagal dengan kode ${exitCode}` });
        }
      });

      return;
    }

    if (!app.wingetId) {
      const err = `Aplikasi ${app.nama} tidak memiliki wingetId`;
      logger.error(err);
      return resolve({ success: false, exitCode: -1, message: err });
    }

    const args = [
      'install',
      '--id',
      app.wingetId,
      '-e',
      '--silent',
      '--accept-package-agreements',
      '--accept-source-agreements',
      '--disable-interactivity'
    ];

    // If custom silentArgs provided
    if (app.silentArgs && app.silentArgs.length > 0) {
      for (const arg of app.silentArgs) {
        if (!args.includes(arg)) {
          args.push(arg);
        }
      }
    }

    logger.info(`Menjalankan winget: winget ${args.join(' ')}`);
    options.onLog?.(`[WINGET] Menjalankan: winget ${args.join(' ')}`);

    let proc: ChildProcess | null = null;
    let aborted = false;

    try {
      proc = spawn('winget', args, {
        windowsHide: true,
        stdio: ['ignore', 'pipe', 'pipe']
      });
    } catch (err: any) {
      logger.error(`Gagal spawn winget: ${err.message}`);
      return resolve({
        success: false,
        exitCode: -1,
        message: `Gagal menjalankan winget: ${err.message}`
      });
    }

    if (options.abortSignal) {
      options.abortSignal.addEventListener('abort', () => {
        aborted = true;
        logger.warn(`Instalasi ${app.nama} dibatalkan oleh pengguna.`);
        options.onLog?.(`[WINGET] Pembatalan diminta oleh pengguna.`);
        if (proc && !proc.killed) {
          try {
            // Kill process tree
            spawn('taskkill', ['/pid', String(proc.pid), '/f', '/t'], { windowsHide: true });
          } catch {
            proc.kill();
          }
        }
        resolve({
          success: false,
          exitCode: -999,
          message: 'Instalasi dibatalkan'
        });
      });
    }

    let lastPercentage = 0;

    const handleChunk = (chunk: Buffer) => {
      const text = chunk.toString();
      const lines = text.split(/\r?\n/).filter(l => l.trim().length > 0);

      for (const line of lines) {
        options.onLog?.(`[WINGET] ${line}`);
        const parsed = parseWingetOutput(line);

        if (parsed.percentage !== undefined) {
          lastPercentage = parsed.percentage;
        }

        if (parsed.status) {
          options.onProgress?.({
            appId: app.id,
            status: parsed.status === 'already_installed' ? 'completed' : parsed.status,
            percentage: lastPercentage,
            message: parsed.message
          });
        } else if (parsed.percentage !== undefined) {
          options.onProgress?.({
            appId: app.id,
            percentage: parsed.percentage
          });
        }
      }
    };

    proc.stdout?.on('data', handleChunk);
    proc.stderr?.on('data', handleChunk);

    proc.on('close', (code) => {
      if (aborted) return;

      const exitCode = code ?? -1;
      logger.info(`Winget selesai untuk ${app.nama} dengan exit code: ${exitCode}`);

      // Windows exit codes:
      // 0 = Success
      // 0x8a150049 (-1978335159) = Package already installed
      // 0x8a15002b = Restart required but installed
      if (exitCode === 0) {
        options.onProgress?.({
          appId: app.id,
          status: 'completed',
          percentage: 100,
          message: 'Berhasil diinstal!'
        });
        resolve({ success: true, exitCode, message: 'Berhasil diinstal' });
      } else if (exitCode === -1978335159 || exitCode === 2316632137) {
        // Already installed
        options.onProgress?.({
          appId: app.id,
          status: 'completed',
          percentage: 100,
          message: 'Sudah terpasang sebelumnya'
        });
        resolve({ success: true, exitCode, message: 'Sudah terpasang' });
      } else if (exitCode === 3010) {
        // Reboot required
        options.onProgress?.({
          appId: app.id,
          status: 'completed',
          percentage: 100,
          message: 'Berhasil diinstal (perlu restart)'
        });
        resolve({ success: true, exitCode, message: 'Berhasil (perlu restart)' });
      } else {
        const errorMsg = `Instalasi gagal dengan kode keluar ${exitCode}`;
        options.onProgress?.({
          appId: app.id,
          status: 'failed',
          percentage: lastPercentage,
          error: errorMsg
        });
        resolve({ success: false, exitCode, message: errorMsg });
      }
    });

    proc.on('error', (err) => {
      if (aborted) return;
      logger.error(`Error proses winget: ${err.message}`);
      resolve({
        success: false,
        exitCode: -1,
        message: `Error menjalankan winget: ${err.message}`
      });
    });
  });
}
