import React, { useState, useEffect } from 'react';
import {
  RefreshCw,
  Download,
  Shield,
  HardDrive,
  Copy,
  AlertTriangle,
  CheckCircle,
  ExternalLink,
  RotateCcw,
  FolderDown,
  Layers,
  Wrench
} from 'lucide-react';
import {
  DriverCenterScanResult,
  DeviceInfo,
  WindowsUpdateDriver
} from '../../electron/types';

export const DriverCenterTab: React.FC = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<DriverCenterScanResult | null>(null);
  const [selectedWuDriverIds, setSelectedWuDriverIds] = useState<string[]>([]);
  const [isInstalling, setIsInstalling] = useState(false);
  const [installStatus, setInstallStatus] = useState<string | null>(null);
  const [needsRestart, setNeedsRestart] = useState(false);
  const [copiedReport, setCopiedReport] = useState(false);

  // Restore point & backup state
  const [restorePointStatus, setRestorePointStatus] = useState<string | null>(null);
  const [backupStatus, setBackupStatus] = useState<string | null>(null);

  // Safety confirmation dialog
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    description: '',
    onConfirm: () => {}
  });

  const handleScan = async () => {
    setIsScanning(true);
    setInstallStatus(null);
    try {
      const res = await window.api?.scanDrivers();
      if (res) {
        setScanResult(res);
        if (res.windowsUpdateDrivers && res.windowsUpdateDrivers.length > 0) {
          setSelectedWuDriverIds(res.windowsUpdateDrivers.map((d: WindowsUpdateDriver) => d.id));
        }
      }
    } catch (err: any) {
      console.error('Scan error:', err);
    } finally {
      setIsScanning(false);
    }
  };

  useEffect(() => {
    handleScan();
  }, []);

  const handleToggleWuSelect = (id: string) => {
    setSelectedWuDriverIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleCreateRestorePoint = async () => {
    setRestorePointStatus('Sedang membuat System Restore Point...');
    const res = await window.api?.createRestorePoint('Kickstart Driver Install Point');
    if (res?.success) {
      setRestorePointStatus('System Restore Point berhasil dibuat!');
    } else {
      setRestorePointStatus(`Peringatan: ${res?.message}`);
    }
  };

  const handleBackupDrivers = async () => {
    setBackupStatus('Mengekspor driver pihak ketiga...');
    const res = await window.api?.backupDrivers();
    if (res?.success) {
      setBackupStatus(`Driver berhasil dibackup ke: ${res.path}`);
    } else {
      setBackupStatus(res?.message || 'Batal memilih folder.');
    }
  };

  const executeInstallWindowsUpdate = async () => {
    if (selectedWuDriverIds.length === 0) return;
    setIsInstalling(true);
    setInstallStatus('Menjalankan proses download dan instalasi driver Windows Update...');

    try {
      const res = await window.api?.installWindowsUpdateDrivers(selectedWuDriverIds);
      if (res?.success) {
        setInstallStatus(res.message);
        if (res.needsRestart) {
          setNeedsRestart(true);
        }
        // Rescan after install to verify reduced problems
        await handleScan();
      } else {
        setInstallStatus(`Gagal: ${res?.message}`);
      }
    } catch (err: any) {
      setInstallStatus(`Error: ${err.message}`);
    } finally {
      setIsInstalling(false);
    }
  };

  const handleRequestInstallWu = () => {
    const isDualGpu = scanResult?.hardware.gpuVendor === 'Multiple';
    const warningText = isDualGpu
      ? 'Perhatian: Terdeteksi sistem dengan Dual GPU (Integrated + Dedicated GPU). Disarankan membuat System Restore Point terlebih dahulu.'
      : 'Pastikan koneksi internet stabil selama download driver berjalan.';

    setConfirmDialog({
      isOpen: true,
      title: 'Konfirmasi Instalasi Driver Windows Update',
      description: `Apakah Anda yakin ingin memasang ${selectedWuDriverIds.length} driver yang dipilih?\n\n${warningText}`,
      onConfirm: () => {
        setConfirmDialog((p) => ({ ...p, isOpen: false }));
        executeInstallWindowsUpdate();
      }
    });
  };

  const handleCopyReport = async () => {
    if (!scanResult) return;
    try {
      const reportText = await window.api?.copyDeviceReport(scanResult);
      if (reportText) {
        navigator.clipboard.writeText(reportText);
        setCopiedReport(true);
        setTimeout(() => setCopiedReport(false), 2000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRestartNow = () => {
    window.api?.restartNow();
  };

  const handleInstallAppByWingetId = async (wingetId: string) => {
    window.api?.startInstallQueue([wingetId], {});
  };

  const handleOpenUrl = (url?: string) => {
    if (url) window.api?.openExternal(url);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Header & Device Summary */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'var(--surface)',
          padding: '14px 18px',
          borderRadius: '10px',
          border: '1px solid var(--border)',
          borderLeft: '3px solid var(--purple)'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text)' }}>
              Driver Center
            </h2>
            {scanResult && (
              <span
                style={{
                  fontSize: '12px',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  backgroundColor: scanResult.hardware.problemCount > 0 ? 'rgba(239, 68, 68, 0.15)' : 'rgba(61, 220, 151, 0.15)',
                  color: scanResult.hardware.problemCount > 0 ? 'var(--danger)' : 'var(--green)'
                }}
              >
                {scanResult.hardware.problemCount > 0
                  ? `${scanResult.hardware.problemCount} perangkat butuh driver`
                  : 'Semua perangkat normal'}
              </span>
            )}
          </div>
          <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '2px' }}>
            {scanResult
              ? `${scanResult.hardware.manufacturer} ${scanResult.hardware.model} • GPU: ${scanResult.hardware.gpus.join(', ') || 'N/A'}`
              : 'Memindai perangkat hardware Windows...'}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn-secondary" onClick={handleCopyReport} disabled={!scanResult}>
            <Copy size={13} /> {copiedReport ? 'Laporan Disalin!' : 'Salin Laporan'}
          </button>
          <button className="btn-purple" onClick={handleScan} disabled={isScanning}>
            <RefreshCw size={13} className={isScanning ? 'animate-spin' : ''} />
            {isScanning ? 'Memindai...' : 'Scan Perangkat'}
          </button>
        </div>
      </div>

      {/* Safety Section (Restore Point & Driver Backup) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '12px'
        }}
      >
        <div className="app-card" style={{ padding: '12px', gap: '6px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Shield size={16} color="var(--purple)" />
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)' }}>System Restore Point</span>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--muted)' }}>
            Buat titik pemulihan sistem sebelum instalasi driver untuk perlindungan total.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '4px' }}>
            <button className="btn-secondary" onClick={handleCreateRestorePoint}>
              Buat Restore Point
            </button>
            {restorePointStatus && (
              <span style={{ fontSize: '11px', color: 'var(--muted)', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {restorePointStatus}
              </span>
            )}
          </div>
        </div>

        <div className="app-card" style={{ padding: '12px', gap: '6px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FolderDown size={16} color="var(--blue)" />
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)' }}>Backup Driver Terpasang</span>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--muted)' }}>
            Ekspor semua driver pihak ketiga di sistem (Export-WindowsDriver) ke folder aman.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '4px' }}>
            <button className="btn-secondary" onClick={handleBackupDrivers}>
              Pilih Folder & Ekspor
            </button>
            {backupStatus && (
              <span style={{ fontSize: '11px', color: 'var(--muted)', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {backupStatus}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Reboot Alert Banner if needed */}
      {needsRestart && (
        <div
          style={{
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid var(--danger)',
            padding: '10px 16px',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '13px',
            color: '#fff'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <RotateCcw size={15} color="var(--danger)" />
            <span>Driver berhasil dipasang! Komputer memerlukan restart agar driver baru aktif sempurna.</span>
          </div>
          <button className="btn-danger" onClick={handleRestartNow}>
            Restart Sekarang
          </button>
        </div>
      )}

      {/* Install via Windows Update Section */}
      <div className="app-card" style={{ padding: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <div>
            <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>
              1. Jalur Utama: Windows Update Driver
            </div>
            <div style={{ fontSize: '12px', color: 'var(--muted)' }}>
              Mencari driver tervalidasi langsung lewat Microsoft Update Catalog
            </div>
          </div>

          <button
            className="btn-primary"
            disabled={selectedWuDriverIds.length === 0 || isInstalling}
            onClick={handleRequestInstallWu}
          >
            <Download size={14} />
            {isInstalling ? 'Memasang...' : `Install via Windows Update (${selectedWuDriverIds.length})`}
          </button>
        </div>

        {installStatus && (
          <div style={{ fontSize: '12px', color: 'var(--blue)', marginBottom: '8px' }}>
            {installStatus}
          </div>
        )}

        {scanResult?.windowsUpdateDrivers && scanResult.windowsUpdateDrivers.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {scanResult.windowsUpdateDrivers.map((wu) => (
              <label
                key={wu.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '6px 10px',
                  background: 'var(--surface-2)',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
              >
                <input
                  type="checkbox"
                  checked={selectedWuDriverIds.includes(wu.id)}
                  onChange={() => handleToggleWuSelect(wu.id)}
                  style={{ accentColor: 'var(--green)' }}
                />
                <span style={{ flex: 1, color: 'var(--text)' }}>{wu.title}</span>
                {wu.sizeMB && <span className="mono-version" style={{ color: 'var(--muted)' }}>{wu.sizeMB} MB</span>}
              </label>
            ))}
          </div>
        ) : (
          <div style={{ fontSize: '12px', color: 'var(--muted)', padding: '6px 0' }}>
            Tidak ada driver tertunda dari Windows Update Catalog.
          </div>
        )}
      </div>

      {/* Secondary Cards: GPU Tool, OEM Tool, Cadangan SDIO */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px' }}>
        {/* GPU Tool */}
        <div className="app-card" style={{ padding: '12px' }}>
          <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)', marginBottom: '4px' }}>
            Tool Resmi GPU ({scanResult?.hardware.gpuVendor || 'Vendor'})
          </div>
          <div style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '8px' }}>
            Untuk fitur gaming, resolusi tinggi, dan driver display terbaru.
          </div>
          {scanResult?.gpuTools && scanResult.gpuTools.length > 0 ? (
            scanResult.gpuTools.map((gt, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '6px' }}>
                <span style={{ fontSize: '12px', color: 'var(--text)' }}>{gt.name}</span>
                {gt.wingetId ? (
                  <button className="btn-secondary" onClick={() => handleInstallAppByWingetId(gt.wingetId!)}>
                    Pasang
                  </button>
                ) : (
                  <button className="btn-secondary" onClick={() => handleOpenUrl(gt.url)}>
                    Unduh <ExternalLink size={11} />
                  </button>
                )}
              </div>
            ))
          ) : (
            <div style={{ fontSize: '12px', color: 'var(--muted)' }}>GPU driver standar sudah terpasang.</div>
          )}
        </div>

        {/* OEM Tool */}
        <div className="app-card" style={{ padding: '12px' }}>
          <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)', marginBottom: '4px' }}>
            Tool Resmi Pabrikan ({scanResult?.hardware.manufacturer || 'OEM'})
          </div>
          <div style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '8px' }}>
            Update BIOS, chipset, touchpad, dan utility resmi perangkat.
          </div>
          {scanResult?.oemTool ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '6px' }}>
              <span style={{ fontSize: '12px', color: 'var(--text)' }}>{scanResult.oemTool.name}</span>
              {scanResult.oemTool.wingetId ? (
                <button className="btn-secondary" onClick={() => handleInstallAppByWingetId(scanResult.oemTool!.wingetId!)}>
                  Pasang
                </button>
              ) : (
                <button className="btn-secondary" onClick={() => handleOpenUrl(scanResult.oemTool!.url)}>
                  Buka Situs <ExternalLink size={11} />
                </button>
              )}
            </div>
          ) : (
            <div style={{ fontSize: '12px', color: 'var(--muted)' }}>Gunakan Windows Update atau situs resmi pabrikan.</div>
          )}
        </div>

        {/* Cadangan SDIO */}
        <div className="app-card" style={{ padding: '12px' }}>
          <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)', marginBottom: '4px' }}>
            Cadangan: SDIO (Open Source)
          </div>
          <div style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '8px' }}>
            Snappy Driver Installer Origin untuk hardware lawas/tanpa koneksi internet.
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '6px' }}>
            <span style={{ fontSize: '12px', color: 'var(--text)' }}>SDIO Portable</span>
            <button
              className="btn-secondary"
              onClick={() => handleInstallAppByWingetId('GlennDelahoy.SnappyDriverInstallerOrigin')}
            >
              Pasang SDIO
            </button>
          </div>
          <div style={{ fontSize: '11px', color: 'var(--purple)', marginTop: '4px' }}>
            *Peringatan: Paket driver pack SDIO lengkap berukuran besar.
          </div>
        </div>
      </div>

      {/* Device Table (per-row sources, no blind install all) */}
      <div className="app-card" style={{ padding: '0', overflow: 'hidden' }}>
        <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--border)', fontSize: '13px', fontWeight: 600 }}>
          Daftar Perangkat Sistem ({scanResult?.devices.length || 0})
        </div>

        <div style={{ maxHeight: '340px', overflowY: 'auto' }}>
          <table className="driver-table">
            <thead>
              <tr>
                <th style={{ width: '35%' }}>Nama Perangkat</th>
                <th style={{ width: '20%' }}>Kelas</th>
                <th style={{ width: '20%' }}>Status</th>
                <th style={{ width: '25%' }}>Sumber yang Disarankan</th>
              </tr>
            </thead>
            <tbody>
              {scanResult?.devices && scanResult.devices.length > 0 ? (
                scanResult.devices.map((dev) => (
                  <tr key={dev.instanceId}>
                    <td style={{ color: 'var(--text)' }}>
                      <div style={{ fontWeight: 500 }}>{dev.name}</div>
                      {dev.hardwareIds.length > 0 && (
                        <div className="mono-version" style={{ fontSize: '11px', color: 'var(--muted)' }}>
                          {dev.hardwareIds[0]}
                        </div>
                      )}
                    </td>
                    <td style={{ color: 'var(--muted)' }}>{dev.deviceClass}</td>
                    <td>
                      {dev.status === 'OK' ? (
                        <span className="status-tag installed">
                          <span className="status-dot green" /> OK
                        </span>
                      ) : dev.status === 'Driver Hilang' ? (
                        <span className="status-tag update">
                          <span className="status-dot danger" /> Driver Hilang
                        </span>
                      ) : (
                        <span className="status-tag" style={{ color: 'var(--purple)' }}>
                          <span className="status-dot purple" /> {dev.status}
                        </span>
                      )}
                    </td>
                    <td>
                      <span style={{ fontSize: '12px', color: dev.status === 'OK' ? 'var(--muted)' : 'var(--blue)' }}>
                        {dev.suggestedSource}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', padding: '24px', color: 'var(--muted)' }}>
                    {isScanning ? 'Sedang memindai perangkat...' : 'Klik Scan Perangkat untuk memulai.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation Dialog */}
      {confirmDialog.isOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '440px' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--purple)' }}>
                <AlertTriangle size={16} />
                <h3 style={{ fontSize: '14px', fontWeight: 600 }}>{confirmDialog.title}</h3>
              </div>
            </div>
            <div className="modal-body">
              <p style={{ color: 'var(--text)', fontSize: '13px', whiteSpace: 'pre-line' }}>
                {confirmDialog.description}
              </p>
            </div>
            <div className="modal-footer">
              <button
                className="btn-secondary"
                onClick={() => setConfirmDialog((p) => ({ ...p, isOpen: false }))}
              >
                Batal
              </button>
              <button className="btn-primary" onClick={confirmDialog.onConfirm}>
                Ya, Pasang Sekarang
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
