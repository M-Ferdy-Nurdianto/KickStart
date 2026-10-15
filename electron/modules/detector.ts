import { exec } from 'child_process';
import { promisify } from 'util';
import { AppItem, InstalledAppInfo } from '../types';
import { logger } from './logger';

const execAsync = promisify(exec);

let cachedDetection: Record<string, InstalledAppInfo> | null = null;
let lastDetectTime = 0;
const CACHE_TTL_MS = 60 * 1000; // 1 minute cache

export async function detectInstalledApps(apps: AppItem[], forceRefresh = false): Promise<Record<string, InstalledAppInfo>> {
  const now = Date.now();
  if (!forceRefresh && cachedDetection && now - lastDetectTime < CACHE_TTL_MS) {
    return cachedDetection;
  }

  const result: Record<string, InstalledAppInfo> = {};
  for (const app of apps) {
    result[app.id] = { installed: false };
  }

  try {
    logger.info('Mendeteksi software terinstal di sistem Windows via winget list...');
    // Run winget list with windowsHide
    const { stdout } = await execAsync('winget list', {
      windowsHide: true,
      maxBuffer: 10 * 1024 * 1024
    });

    const lines = stdout.split(/\r?\n/);

    for (const line of lines) {
      const lowerLine = line.toLowerCase();
      for (const app of apps) {
        if (app.wingetId && lowerLine.includes(app.wingetId.toLowerCase())) {
          // Found match
          const parts = line.trim().split(/\s{2,}/);
          const version = parts.length >= 3 ? parts[2] : undefined;
          const hasUpdate = parts.length >= 4 && parts[3].length > 0 && !parts[3].includes('winget') && !parts[3].includes('msstore');

          result[app.id] = {
            installed: true,
            version: version || 'Terpasang',
            hasUpdate: Boolean(hasUpdate)
          };
        } else if (app.source === 'github-release') {
          // Check by name
          if (lowerLine.includes(app.nama.toLowerCase())) {
            const parts = line.trim().split(/\s{2,}/);
            const version = parts.length >= 3 ? parts[2] : undefined;
            result[app.id] = {
              installed: true,
              version: version || 'Terpasang',
              hasUpdate: false
            };
          }
        }
      }
    }
  } catch (err: any) {
    logger.warn(`Winget list deteksi error: ${err.message}. Mencoba fallback registry...`);
  }

  // Quick check for CLI tools like supabase
  if (result['supabase-local'] && !result['supabase-local'].installed) {
    try {
      const { stdout } = await execAsync('supabase --version', { windowsHide: true });
      if (stdout && stdout.trim().length > 0) {
        result['supabase-local'] = {
          installed: true,
          version: stdout.trim(),
          hasUpdate: false
        };
      }
    } catch {}
  }

  // Registry check fallback for apps still undetected
  try {
    const regKeys = [
      'HKLM\\Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall',
      'HKLM\\Software\\Wow6432Node\\Microsoft\\Windows\\CurrentVersion\\Uninstall',
      'HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall'
    ];

    for (const regKey of regKeys) {
      try {
        const { stdout } = await execAsync(`reg query "${regKey}" /s /v DisplayName`, {
          windowsHide: true,
          maxBuffer: 5 * 1024 * 1024
        });

        const lowerOut = stdout.toLowerCase();
        for (const app of apps) {
          if (!result[app.id]?.installed) {
            if (lowerOut.includes(app.nama.toLowerCase())) {
              result[app.id] = {
                installed: true,
                version: 'Terpasang',
                hasUpdate: false
              };
            }
          }
        }
      } catch {}
    }
  } catch (err: any) {
    logger.warn(`Registry query error: ${err.message}`);
  }

  cachedDetection = result;
  lastDetectTime = Date.now();
  return result;
}
