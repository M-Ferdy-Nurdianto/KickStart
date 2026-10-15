import { execFile, spawn } from 'child_process';
import os from 'os';
import dns from 'dns';
import { promisify } from 'util';
import { SystemStatus } from '../types';

const execFileAsync = promisify(execFile);

export async function checkIsAdmin(): Promise<boolean> {
  return new Promise((resolve) => {
    // fltmc works on all Windows NT versions to check elevation
    execFile('fltmc', [], (err) => {
      resolve(!err);
    });
  });
}

export async function checkWinget(): Promise<{ available: boolean; version?: string }> {
  try {
    const { stdout } = await execFileAsync('winget', ['--version'], {
      windowsHide: true,
      encoding: 'utf8'
    });
    return {
      available: true,
      version: stdout.trim()
    };
  } catch {
    return { available: false };
  }
}

export async function checkInternet(): Promise<boolean> {
  return new Promise((resolve) => {
    dns.lookup('dns.google', (err) => {
      if (!err) {
        resolve(true);
      } else {
        dns.lookup('cloudflare.com', (err2) => {
          resolve(!err2);
        });
      }
    });
  });
}

export async function getDiskSpaceC(): Promise<{ freeGB: number; totalGB: number }> {
  return new Promise((resolve) => {
    // Using powershell to get exact C: drive capacity
    const ps = spawn('powershell.exe', [
      '-NoProfile',
      '-Command',
      `
      $vol = Get-Volume -DriveLetter C -ErrorAction SilentlyContinue
      if ($vol) {
        Write-Output "$($vol.SizeRemaining)|$($vol.Size)"
      } else {
        Write-Output "0|0"
      }
      `
    ], { windowsHide: true });

    let stdout = '';
    ps.stdout.on('data', (d) => {
      stdout += d.toString();
    });

    ps.on('close', () => {
      const parts = stdout.trim().split('|');
      if (parts.length === 2) {
        const freeBytes = parseInt(parts[0], 10) || 0;
        const totalBytes = parseInt(parts[1], 10) || 0;
        resolve({
          freeGB: Math.round((freeBytes / (1024 * 1024 * 1024)) * 10) / 10,
          totalGB: Math.round((totalBytes / (1024 * 1024 * 1024)) * 10) / 10
        });
      } else {
        resolve({ freeGB: 0, totalGB: 0 });
      }
    });

    ps.on('error', () => {
      resolve({ freeGB: 0, totalGB: 0 });
    });
  });
}

export async function getSystemStatus(): Promise<SystemStatus> {
  const [isAdmin, wingetInfo, hasInternet, disk] = await Promise.all([
    checkIsAdmin(),
    checkWinget(),
    checkInternet(),
    getDiskSpaceC()
  ]);

  return {
    isAdmin,
    hasWinget: wingetInfo.available,
    wingetVersion: wingetInfo.version,
    hasInternet,
    osVersion: `${os.type()} ${os.release()}`,
    osArch: process.arch,
    computerName: os.hostname(),
    userName: os.userInfo().username,
    diskFreeGB: disk.freeGB,
    diskTotalGB: disk.totalGB
  };
}
