import { spawn } from 'child_process';
import path from 'path';
import os from 'os';
import fs from 'fs';
import { logger } from './logger';
import { TweakResult } from '../types';

export interface TweakProgressCallback {
  (chunk: string): void;
}

/**
 * Helper to run a command with argument array safely (no raw shell string concat).
 */
function runCommandSafe(
  command: string,
  args: string[],
  onData?: TweakProgressCallback
): Promise<TweakResult> {
  return new Promise((resolve) => {
    let output = '';
    let hasError = false;

    try {
      const proc = spawn(command, args, {
        windowsHide: true,
        stdio: ['ignore', 'pipe', 'pipe']
      });

      proc.stdout.on('data', (d) => {
        const text = d.toString();
        output += text;
        onData?.(text);
      });

      proc.stderr.on('data', (d) => {
        const text = d.toString();
        output += text;
        onData?.(text);
      });

      proc.on('close', (code) => {
        resolve({
          success: code === 0,
          output,
          error: code === 0 ? undefined : `Proses keluar dengan status code ${code}`
        });
      });

      proc.on('error', (err) => {
        hasError = true;
        resolve({
          success: false,
          output,
          error: err.message
        });
      });
    } catch (err: any) {
      resolve({
        success: false,
        output: '',
        error: err.message
      });
    }
  });
}

/**
 * 1. Clean Temp & Cache
 */
export async function cleanTempCache(onProgress?: TweakProgressCallback): Promise<TweakResult> {
  logger.info('[TWEAKS] Memulai pembersihan cache dan temporary files...');
  onProgress?.('🧹 Memulai pembersihan temporary files dan cache...\r\n');

  let deletedCount = 0;
  const tempPaths = [
    os.tmpdir(),
    'C:\\Windows\\Temp',
    'C:\\Windows\\Prefetch',
    'C:\\Windows\\SoftwareDistribution\\Download'
  ];

  for (const dir of tempPaths) {
    if (fs.existsSync(dir)) {
      onProgress?.(`Membersihkan direktori: ${dir}...\r\n`);
      try {
        const items = fs.readdirSync(dir);
        for (const item of items) {
          const fullPath = path.join(dir, item);
          try {
            const stat = fs.lstatSync(fullPath);
            if (stat.isDirectory()) {
              fs.rmSync(fullPath, { recursive: true, force: true });
            } else {
              fs.unlinkSync(fullPath);
            }
            deletedCount++;
          } catch {
            // File in use, ignore
          }
        }
      } catch (err: any) {
        onProgress?.(`Info: ${err.message}\r\n`);
      }
    }
  }

  // Empty Recycle Bin via PowerShell safe call
  onProgress?.('Mengosongkan Recycle Bin...\r\n');
  await runCommandSafe('powershell.exe', [
    '-NoProfile',
    '-Command',
    'Clear-RecycleBin -Force -ErrorAction SilentlyContinue'
  ]);

  const msg = `✅ Pembersihan selesai! ${deletedCount} file/folder sementara berhasil dibersihkan.`;
  logger.success(msg);
  onProgress?.(msg + '\r\n');

  return { success: true, output: msg };
}

/**
 * 2. Toggle Hibernation
 */
export async function toggleHibernation(enable: boolean, onProgress?: TweakProgressCallback): Promise<TweakResult> {
  const mode = enable ? 'on' : 'off';
  logger.info(`[TWEAKS] Mengubah status hibernasi menjadi: ${mode}`);
  onProgress?.(`Mengatur hibernasi: powercfg /hibernate ${mode}...\r\n`);

  const res = await runCommandSafe('powercfg.exe', ['/hibernate', mode], onProgress);
  if (res.success) {
    const text = enable ? '✅ Hibernasi berhasil DIAKTIFKAN.' : '⚡ Hibernasi berhasil DIMATIKAN (File hiberfil.sys telah dihapus).';
    logger.success(text);
    onProgress?.(text + '\r\n');
    return { success: true, output: text };
  }
  return res;
}

/**
 * 3. Clear Event Viewer Logs (Risky Action)
 */
export async function clearEventLogs(onProgress?: TweakProgressCallback): Promise<TweakResult> {
  logger.warn('[TWEAKS] Menghapus log Windows Event Viewer...');
  onProgress?.('⚠️ Menghapus log Windows Event Viewer...\r\n');

  const logs = ['Application', 'System', 'Security', 'Setup'];
  let allSuccess = true;

  for (const log of logs) {
    onProgress?.(`Menghapus log: ${log}...\r\n`);
    const r = await runCommandSafe('wevtutil.exe', ['cl', log], onProgress);
    if (!r.success) allSuccess = false;
  }

  const msg = allSuccess ? '✅ Semua log Event Viewer berhasil dibersihkan.' : 'Sebagian log tidak dapat dihapus.';
  onProgress?.(msg + '\r\n');
  return { success: allSuccess, output: msg };
}

/**
 * 4. Toggle Windows Update (Risky Action)
 */
export async function toggleWindowsUpdate(enable: boolean, onProgress?: TweakProgressCallback): Promise<TweakResult> {
  logger.warn(`[TWEAKS] Mengatur Windows Update: ${enable ? 'Aktif' : 'Nonaktif'}`);

  if (enable) {
    onProgress?.('Mengaktifkan layanan Windows Update...\r\n');
    await runCommandSafe('sc.exe', ['config', 'wuauserv', 'start=', 'auto'], onProgress);
    await runCommandSafe('sc.exe', ['start', 'wuauserv'], onProgress);
    await runCommandSafe('sc.exe', ['config', 'UsoSvc', 'start=', 'auto'], onProgress);
    await runCommandSafe('sc.exe', ['start', 'UsoSvc'], onProgress);
    const msg = '✅ Layanan Windows Update berhasil diaktifkan kembali.';
    logger.success(msg);
    onProgress?.(msg + '\r\n');
    return { success: true, output: msg };
  } else {
    onProgress?.('Menonaktifkan layanan Windows Update...\r\n');
    await runCommandSafe('sc.exe', ['stop', 'wuauserv'], onProgress);
    await runCommandSafe('sc.exe', ['config', 'wuauserv', 'start=', 'disabled'], onProgress);
    await runCommandSafe('sc.exe', ['stop', 'UsoSvc'], onProgress);
    await runCommandSafe('sc.exe', ['config', 'UsoSvc', 'start=', 'disabled'], onProgress);
    const msg = '⚡ Layanan Windows Update berhasil dimatikan.';
    logger.warn(msg);
    onProgress?.(msg + '\r\n');
    return { success: true, output: msg };
  }
}

/**
 * 5. Run System File Checker (SFC)
 */
export async function runSfc(onProgress?: TweakProgressCallback): Promise<TweakResult> {
  logger.info('[TWEAKS] Menjalankan System File Checker (sfc /scannow)...');
  onProgress?.('🛡️ Memulai SFC Scan (proses ini butuh waktu beberapa menit)...\r\n');

  return await runCommandSafe('sfc.exe', ['/scannow'], onProgress);
}

/**
 * 6. Run DISM RestoreHealth
 */
export async function runDism(onProgress?: TweakProgressCallback): Promise<TweakResult> {
  logger.info('[TWEAKS] Menjalankan DISM RestoreHealth...');
  onProgress?.('🔧 Memulai DISM Online RestoreHealth...\r\n');

  return await runCommandSafe(
    'DISM.exe',
    ['/Online', '/Cleanup-Image', '/RestoreHealth'],
    onProgress
  );
}

/**
 * 7. Add New User & Admin (Password input strictly masked and NEVER logged)
 */
export async function addNewUser(
  username: string,
  password?: string,
  makeAdmin: boolean = true,
  onProgress?: TweakProgressCallback
): Promise<TweakResult> {
  // Strict sanitization: alphanumeric, underscore, dot, dash only
  const cleanUsername = username.trim();
  if (!/^[a-zA-Z0-9._-]+$/.test(cleanUsername)) {
    return {
      success: false,
      output: '',
      error: 'Nama user hanya boleh mengandung huruf, angka, titik, strip, dan underscore.'
    };
  }

  // Password is NOT logged in log files!
  logger.info(`[TWEAKS] Membuat akun user baru: "${cleanUsername}" (Admin: ${makeAdmin}, Password: [TERSEMBUNYI])`);
  onProgress?.(`Membuat akun pengguna: ${cleanUsername}...\r\n`);

  const passParam = password && password.length > 0 ? password : '""';
  const addRes = await runCommandSafe('net.exe', ['user', cleanUsername, passParam, '/add'], (txt) => {
    // Filter out password from any progress text
    const masked = password && password.length > 0 ? txt.replace(new RegExp(password, 'g'), '******') : txt;
    onProgress?.(masked);
  });

  if (!addRes.success) {
    return addRes;
  }

  if (makeAdmin) {
    onProgress?.(`Menjadikan "${cleanUsername}" sebagai Administrator...\r\n`);
    await runCommandSafe('net.exe', ['localgroup', 'Administrators', cleanUsername, '/add'], onProgress);
  }

  const successMsg = `✅ Pengguna "${cleanUsername}" berhasil dibuat${makeAdmin ? ' sebagai Administrator' : ''}!`;
  logger.success(successMsg);
  onProgress?.(successMsg + '\r\n');

  return { success: true, output: successMsg };
}

/**
 * 8. Run Disk Cleanup for specific drive
 */
export async function runDiskCleanup(drive: string = 'C', onProgress?: TweakProgressCallback): Promise<TweakResult> {
  const cleanDrive = drive.trim().toUpperCase().charAt(0) || 'C';
  if (!/^[A-Z]$/.test(cleanDrive)) {
    return { success: false, output: '', error: 'Huruf drive tidak valid' };
  }

  logger.info(`[TWEAKS] Menjalankan cleanmgr pada drive ${cleanDrive}:`);
  onProgress?.(`Membuka Disk Cleanup untuk Drive ${cleanDrive}:...\r\n`);

  // cleanmgr runs as GUI tool, spawn detached or standard
  spawn('cleanmgr.exe', ['/d', `${cleanDrive}:`], {
    detached: true,
    stdio: 'ignore'
  }).unref();

  const msg = `✅ Disk Cleanup untuk drive ${cleanDrive}: telah dibuka.`;
  onProgress?.(msg + '\r\n');
  return { success: true, output: msg };
}

/**
 * 9. Get System Info Report
 */
export async function getSystemInfoReport(onProgress?: TweakProgressCallback): Promise<TweakResult> {
  logger.info('[TWEAKS] Mengambil laporan systeminfo...');
  onProgress?.('📊 Mengambil laporan informasi sistem...\r\n');

  return await runCommandSafe('systeminfo.exe', [], onProgress);
}
