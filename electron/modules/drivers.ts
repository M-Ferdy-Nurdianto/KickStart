import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import { logger } from './logger';
import {
  DeviceInfo,
  HardwareSummary,
  WindowsUpdateDriver,
  DriverCenterScanResult
} from '../types';

function runPowerShellScript(psScript: string): Promise<{ stdout: string; stderr: string; exitCode: number }> {
  return new Promise((resolve) => {
    const child = spawn(
      'powershell.exe',
      ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-Command', psScript],
      { windowsHide: true }
    );

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (d) => {
      stdout += d.toString('utf8');
    });

    child.stderr.on('data', (d) => {
      stderr += d.toString('utf8');
    });

    child.on('close', (code) => {
      resolve({ stdout, stderr, exitCode: code ?? 0 });
    });

    child.on('error', (err) => {
      logger.error(`Driver powerShell spawn error: ${err.message}`);
      resolve({ stdout, stderr: err.message, exitCode: 1 });
    });
  });
}

export async function scanHardwareSummary(): Promise<HardwareSummary> {
  const script = `
$ErrorActionPreference = 'SilentlyContinue'
$cs = Get-CimInstance Win32_ComputerSystem | Select-Object -First 1 Manufacturer, Model
$bb = Get-CimInstance Win32_BaseBoard | Select-Object -First 1 Manufacturer, Product
$gpus = Get-CimInstance Win32_VideoController | Select-Object -ExpandProperty Name
$nets = Get-CimInstance Win32_NetworkAdapter | Where-Object { $_.PhysicalAdapter -eq $true } | Select-Object -ExpandProperty Name
$sounds = Get-CimInstance Win32_SoundDevice | Select-Object -ExpandProperty Name

$summary = [PSCustomObject]@{
  Manufacturer = if ($cs.Manufacturer) { $cs.Manufacturer } else { "Unknown" }
  Model = if ($cs.Model) { $cs.Model } else { "Unknown" }
  BaseBoard = if ($bb.Product) { "$($bb.Manufacturer) $($bb.Product)" } else { "Unknown" }
  Gpus = @($gpus)
  Nets = @($nets)
  Sounds = @($sounds)
}
$summary | ConvertTo-Json -Compress
`;

  try {
    const res = await runPowerShellScript(script);
    const parsed = JSON.parse(res.stdout || '{}');

    const gpus: string[] = Array.isArray(parsed.Gpus) ? parsed.Gpus : (parsed.Gpus ? [parsed.Gpus] : []);
    const gpuText = gpus.join(' ').toLowerCase();

    let gpuVendor: 'NVIDIA' | 'AMD' | 'Intel' | 'Multiple' | 'Unknown' = 'Unknown';
    const hasNvidia = gpuText.includes('nvidia') || gpuText.includes('geforce') || gpuText.includes('quadro');
    const hasAmd = gpuText.includes('amd') || gpuText.includes('radeon');
    const hasIntel = gpuText.includes('intel') || gpuText.includes('uhd') || gpuText.includes('iris') || gpuText.includes('arc');

    const vendorCount = [hasNvidia, hasAmd, hasIntel].filter(Boolean).length;
    if (vendorCount > 1) {
      gpuVendor = 'Multiple';
    } else if (hasNvidia) {
      gpuVendor = 'NVIDIA';
    } else if (hasAmd) {
      gpuVendor = 'AMD';
    } else if (hasIntel) {
      gpuVendor = 'Intel';
    }

    return {
      manufacturer: parsed.Manufacturer || 'Unknown',
      model: parsed.Model || 'Unknown',
      baseBoard: parsed.BaseBoard || 'Unknown',
      gpus,
      gpuVendor,
      networkAdapters: Array.isArray(parsed.Nets) ? parsed.Nets : (parsed.Nets ? [parsed.Nets] : []),
      soundDevices: Array.isArray(parsed.Sounds) ? parsed.Sounds : (parsed.Sounds ? [parsed.Sounds] : []),
      problemCount: 0
    };
  } catch (err: any) {
    logger.error(`Error scanning hardware summary: ${err.message}`);
    return {
      manufacturer: 'Unknown',
      model: 'Unknown',
      baseBoard: 'Unknown',
      gpus: [],
      gpuVendor: 'Unknown',
      networkAdapters: [],
      soundDevices: [],
      problemCount: 0
    };
  }
}

export async function scanPnpDevices(): Promise<DeviceInfo[]> {
  const script = `
$ErrorActionPreference = 'SilentlyContinue'
$all = Get-PnpDevice -PresentOnly | Select-Object InstanceId, FriendlyName, Class, Status, ConfigManagerErrorCode

$items = foreach ($dev in $all) {
  $isProblem = ($dev.Status -ne 'OK') -or ($dev.ConfigManagerErrorCode -ne 0)
  
  $hwIds = @()
  if ($isProblem) {
    try {
      $prop = Get-PnpDeviceProperty -InstanceId $dev.InstanceId -KeyName 'DEVPKEY_Device_HardwareIds' -ErrorAction SilentlyContinue
      if ($prop -and $prop.Data) {
        $hwIds = @($prop.Data)
      }
    } catch {}
  }

  [PSCustomObject]@{
    InstanceId = $dev.InstanceId
    Name = if ($dev.FriendlyName) { $dev.FriendlyName } else { "Unknown Device" }
    Class = if ($dev.Class) { $dev.Class } else { "Other" }
    Status = $dev.Status
    ErrorCode = $dev.ConfigManagerErrorCode
    HardwareIds = $hwIds
  }
}

$items | ConvertTo-Json -Compress
`;

  try {
    const res = await runPowerShellScript(script);
    let parsed: any[] = [];
    if (res.stdout.trim()) {
      const data = JSON.parse(res.stdout);
      parsed = Array.isArray(data) ? data : [data];
    }

    const results: DeviceInfo[] = parsed.map((item) => {
      const isOk = item.Status === 'OK' && (item.ErrorCode === 0 || item.ErrorCode === null);
      let status: 'OK' | 'Driver Hilang' | 'Bermasalah' = 'OK';
      let suggestedSource = 'Sudah Terpasang';

      if (!isOk) {
        if (item.ErrorCode === 28 || item.Status === 'Error' || item.Status === 'Degraded') {
          status = 'Driver Hilang';
          suggestedSource = 'Windows Update / OEM';
        } else {
          status = 'Bermasalah';
          suggestedSource = 'Perlu Update Driver';
        }

        const cls = (item.Class || '').toLowerCase();
        if (cls.includes('display') || cls.includes('video')) {
          suggestedSource = 'Driver GPU Vendor';
        } else if (cls.includes('net') || cls.includes('bluetooth') || cls.includes('media') || cls.includes('audio')) {
          suggestedSource = 'Windows Update';
        }
      }

      return {
        instanceId: item.InstanceId || '',
        name: item.Name || 'Unknown Device',
        deviceClass: item.Class || 'Other',
        status,
        rawStatus: String(item.Status || ''),
        errorCode: Number(item.ErrorCode || 0),
        hardwareIds: Array.isArray(item.HardwareIds) ? item.HardwareIds : [],
        suggestedSource
      };
    });

    // Sort: problem devices first, then alphabetically
    results.sort((a, b) => {
      if (a.status !== 'OK' && b.status === 'OK') return -1;
      if (a.status === 'OK' && b.status !== 'OK') return 1;
      return a.name.localeCompare(b.name);
    });

    return results;
  } catch (err: any) {
    logger.error(`Error scanning PNP devices: ${err.message}`);
    return [];
  }
}

export async function scanWindowsUpdateDrivers(): Promise<WindowsUpdateDriver[]> {
  const script = `
$ErrorActionPreference = 'SilentlyContinue'
try {
  $session = New-Object -ComObject Microsoft.Update.Session
  $searcher = $session.CreateUpdateSearcher()
  $searcher.ServerSelection = 2
  $searchResult = $searcher.Search("IsInstalled=0 and Type='Driver'")
  
  $updates = @()
  foreach ($update in $searchResult.Updates) {
    $kb = @()
    if ($update.KBArticleIDs) {
      $kb = @($update.KBArticleIDs)
    }
    $updates += [PSCustomObject]@{
      Id = $update.Identity.UpdateID
      Title = $update.Title
      Description = if ($update.Description) { $update.Description } else { "" }
      KBArticleIDs = $kb
      MaxDownloadSize = $update.MaxDownloadSize
    }
  }
  $updates | ConvertTo-Json -Compress
} catch {
  Write-Output "[]"
}
`;

  try {
    const res = await runPowerShellScript(script);
    if (!res.stdout.trim() || res.stdout.trim() === '[]') return [];

    const data = JSON.parse(res.stdout);
    const list: any[] = Array.isArray(data) ? data : [data];

    return list.map((item) => ({
      id: item.Id || String(Math.random()),
      title: item.Title || 'Driver Update',
      description: item.Description || '',
      kbArticleIds: Array.isArray(item.KBArticleIDs) ? item.KBArticleIDs : [],
      sizeMB: item.MaxDownloadSize ? Math.round(Number(item.MaxDownloadSize) / (1024 * 1024)) : undefined
    }));
  } catch (err: any) {
    logger.error(`Error scanning Windows Update drivers: ${err.message}`);
    return [];
  }
}

export async function scanAllDriverCenter(): Promise<DriverCenterScanResult> {
  logger.info('Driver Center: Memulai pemindaian perangkat dan hardware...');

  const [hardware, devices, wuDrivers] = await Promise.all([
    scanHardwareSummary(),
    scanPnpDevices(),
    scanWindowsUpdateDrivers()
  ]);

  const problemDevices = devices.filter((d) => d.status !== 'OK');
  hardware.problemCount = problemDevices.length;

  // Determine OEM Tool
  let oemTool: { name: string; wingetId?: string; url?: string } | undefined;
  const mfg = hardware.manufacturer.toLowerCase();

  if (mfg.includes('lenovo')) {
    oemTool = {
      name: 'Lenovo System Update',
      wingetId: 'Lenovo.SystemUpdate'
    };
  } else if (mfg.includes('dell')) {
    oemTool = {
      name: 'Dell Command | Update',
      wingetId: 'Dell.CommandUpdate'
    };
  } else if (mfg.includes('hp') || mfg.includes('hewlett')) {
    oemTool = {
      name: 'HP Support Assistant',
      wingetId: 'HP.SupportAssistant'
    };
  } else if (mfg.includes('asus')) {
    oemTool = {
      name: 'MyASUS',
      wingetId: '9N7R5S6B0ZZH'
    };
  } else if (mfg.includes('msi')) {
    oemTool = {
      name: 'MSI Center',
      wingetId: 'MSI.MSICenter'
    };
  } else if (mfg.includes('acer')) {
    oemTool = {
      name: 'Acer Care Center (Official Support)',
      url: 'https://www.acer.com/support'
    };
  }

  // Determine GPU Tools
  const gpuTools: { name: string; wingetId?: string; url?: string }[] = [];
  const gpusText = hardware.gpus.join(' ').toLowerCase();

  if (gpusText.includes('nvidia') || gpusText.includes('geforce') || gpusText.includes('quadro')) {
    gpuTools.push({
      name: 'NVIDIA App (Official)',
      wingetId: 'XP8CLZL93F5Z4P',
      url: 'https://www.nvidia.com/software/nvidia-app/'
    });
  }

  if (gpusText.includes('intel') || gpusText.includes('uhd') || gpusText.includes('iris') || gpusText.includes('arc')) {
    gpuTools.push({
      name: 'Intel® Driver & Support Assistant',
      wingetId: 'Intel.IntelDriverAndSupportAssistant',
      url: 'https://www.intel.com/content/www/us/en/support/detect.html'
    });
  }

  if (gpusText.includes('amd') || gpusText.includes('radeon')) {
    gpuTools.push({
      name: 'AMD Software: Adrenalin Edition',
      url: 'https://www.amd.com/en/support/download/drivers.html'
    });
  }

  logger.info(
    `Driver Center: Pemindaian selesai. Total perangkat: ${devices.length}, Bermasalah: ${hardware.problemCount}, Windows Update Driver: ${wuDrivers.length}`
  );

  return {
    hardware,
    devices,
    windowsUpdateDrivers: wuDrivers,
    oemTool,
    gpuTools
  };
}

export async function createSystemRestorePoint(description: string = 'Kickstart Driver Install'): Promise<{ success: boolean; message: string }> {
  logger.info(`Membuat System Restore Point: "${description}"...`);

  const script = `
$ErrorActionPreference = 'Stop'
try {
  # Check if System Protection is enabled on C:
  $status = (Get-ComputerRestorePoint -ErrorAction SilentlyContinue)
  Enable-ComputerRestore -Drive "C:\" -ErrorAction SilentlyContinue
  Checkpoint-Computer -Description "${description.replace(/"/g, '')}" -RestorePointType "MODIFY_SETTINGS" -ErrorAction Stop
  Write-Output "SUCCESS"
} catch {
  Write-Error $_.Exception.Message
}
`;

  const res = await runPowerShellScript(script);
  if (res.stdout.includes('SUCCESS')) {
    logger.success('System Restore Point berhasil dibuat!');
    return { success: true, message: 'Restore point berhasil dibuat.' };
  } else {
    const errorMsg = res.stderr || 'Gagal membuat Restore Point. Pastikan System Protection pada drive C: sudah diaktifkan di Windows System Properties.';
    logger.warn(`Restore Point Warning: ${errorMsg}`);
    return { success: false, message: errorMsg };
  }
}

export async function backupInstalledDrivers(targetDir: string): Promise<{ success: boolean; message: string; path?: string }> {
  logger.info(`Mengekspor backup driver pihak ketiga ke: ${targetDir}...`);

  if (!fs.existsSync(targetDir)) {
    try {
      fs.mkdirSync(targetDir, { recursive: true });
    } catch (err: any) {
      return { success: false, message: `Gagal membuat folder tujuan: ${err.message}` };
    }
  }

  const script = `
$ErrorActionPreference = 'Stop'
try {
  Export-WindowsDriver -Online -Destination "${targetDir.replace(/\\/g, '\\\\')}" -ErrorAction Stop
  Write-Output "SUCCESS"
} catch {
  Write-Error $_.Exception.Message
}
`;

  const res = await runPowerShellScript(script);
  if (res.stdout.includes('SUCCESS')) {
    logger.success(`Driver berhasil diekspor ke: ${targetDir}`);
    return { success: true, message: `Driver berhasil diekspor ke ${targetDir}`, path: targetDir };
  } else {
    logger.error(`Gagal mengekspor driver: ${res.stderr}`);
    return { success: false, message: res.stderr || 'Gagal mengekspor driver.' };
  }
}

export async function installWindowsUpdateDrivers(
  updateIds: string[],
  onProgress?: (text: string) => void
): Promise<{ success: boolean; needsRestart: boolean; message: string }> {
  logger.info(`Memasang ${updateIds.length} driver via Windows Update...`);
  onProgress?.(`Menghubungi Windows Update service untuk mengunduh dan memasang driver...`);

  const idsJson = JSON.stringify(updateIds).replace(/"/g, '`"');

  const script = `
$ErrorActionPreference = 'Stop'
try {
  $targetIds = ConvertFrom-Json '${idsJson}'
  $session = New-Object -ComObject Microsoft.Update.Session
  $searcher = $session.CreateUpdateSearcher()
  $searchResult = $searcher.Search("IsInstalled=0 and Type='Driver'")

  $toInstall = New-Object -ComObject Microsoft.Update.UpdateColl
  foreach ($update in $searchResult.Updates) {
    if ($targetIds -contains $update.Identity.UpdateID) {
      $toInstall.Add($update) | Out-Null
      Write-Output "SELECTED: $($update.Title)"
    }
  }

  if ($toInstall.Count -eq 0) {
    Write-Output "NO_UPDATES_FOUND"
    exit 0
  }

  Write-Output "DOWNLOADING: Mengunduh $($toInstall.Count) driver..."
  $downloader = $session.CreateUpdateDownloader()
  $downloader.Updates = $toInstall
  $downRes = $downloader.Download()
  Write-Output "DOWNLOAD_CODE: $($downRes.ResultCode)"

  Write-Output "INSTALLING: Memasang driver ke sistem..."
  $installer = $session.CreateUpdateInstaller()
  $installer.Updates = $toInstall
  $instRes = $installer.Install()

  Write-Output "RESULT_CODE: $($instRes.ResultCode)"
  Write-Output "REBOOT_REQUIRED: $($instRes.RebootRequired)"
} catch {
  Write-Error $_.Exception.Message
}
`;

  const res = await runPowerShellScript(script);
  const out = res.stdout;
  onProgress?.(out);

  const rebootRequired = out.includes('REBOOT_REQUIRED: True') || res.exitCode === 3010;
  const success = out.includes('RESULT_CODE: 2') || out.includes('RESULT_CODE: 0') || out.includes('RESULT_CODE: 1');

  if (success) {
    logger.success(`Driver Windows Update selesai dipasang. Perlu restart: ${rebootRequired ? 'Ya' : 'Tidak'}`);
    return {
      success: true,
      needsRestart: rebootRequired,
      message: rebootRequired ? 'Driver terpasang! Sistem perlu di-restart.' : 'Semua driver Windows Update berhasil dipasang.'
    };
  } else {
    logger.error(`Gagal memasang driver Windows Update: ${res.stderr || out}`);
    return {
      success: false,
      needsRestart: false,
      message: res.stderr || out || 'Gagal memasang driver.'
    };
  }
}

export function generateDeviceReportText(result: DriverCenterScanResult): string {
  const lines: string[] = [];
  const date = new Date().toLocaleString('id-ID');

  lines.push('====================================================');
  lines.push('           LAPORAN HARDWARE & DRIVER KICKSTART       ');
  lines.push('====================================================');
  lines.push(`Waktu Pindai : ${date}`);
  lines.push(`Pabrikan     : ${result.hardware.manufacturer}`);
  lines.push(`Model        : ${result.hardware.model}`);
  lines.push(`Motherboard  : ${result.hardware.baseBoard}`);
  lines.push(`Vendor GPU   : ${result.hardware.gpuVendor}`);
  lines.push(`GPU(s)       : ${result.hardware.gpus.join(', ') || 'None'}`);
  lines.push(`Perangkat Masalah : ${result.hardware.problemCount} perangkat`);
  lines.push('----------------------------------------------------');
  lines.push('DAFTAR PERANGKAT BERMASALAH / TANPA DRIVER:');

  const problemDevs = result.devices.filter(d => d.status !== 'OK');
  if (problemDevs.length === 0) {
    lines.push('Semua perangkat berfungsi normal (OK). Tidak ada driver yang hilang.');
  } else {
    problemDevs.forEach((dev, i) => {
      lines.push(`\n[${i + 1}] ${dev.name}`);
      lines.push(`    Kelas      : ${dev.deviceClass}`);
      lines.push(`    Status     : ${dev.status} (Kode Error: ${dev.errorCode || 'N/A'})`);
      lines.push(`    Sumber     : ${dev.suggestedSource}`);
      lines.push(`    Instance ID: ${dev.instanceId}`);
      if (dev.hardwareIds.length > 0) {
        lines.push(`    Hardware ID: ${dev.hardwareIds[0]}`);
      }
    });
  }

  lines.push('\n----------------------------------------------------');
  lines.push('DRIVER TERSEDIA DI WINDOWS UPDATE:');
  if (result.windowsUpdateDrivers.length === 0) {
    lines.push('Tidak ada update driver tertunda dari Windows Update.');
  } else {
    result.windowsUpdateDrivers.forEach((wu, i) => {
      lines.push(`[${i + 1}] ${wu.title} ${wu.sizeMB ? `(${wu.sizeMB} MB)` : ''}`);
    });
  }

  lines.push('\n----------------------------------------------------');
  lines.push('REKOMENDASI TOOL OEM & GPU:');
  if (result.oemTool) {
    lines.push(`Pabrikan : ${result.oemTool.name} (winget: ${result.oemTool.wingetId || result.oemTool.url})`);
  }
  result.gpuTools.forEach(gt => {
    lines.push(`GPU Tool : ${gt.name} (winget: ${gt.wingetId || gt.url})`);
  });
  lines.push('Cadangan : Snappy Driver Installer Origin (GlennDelahoy.SnappyDriverInstallerOrigin)');
  lines.push('====================================================\n');

  return lines.join('\n');
}
