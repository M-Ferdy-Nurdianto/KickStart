import React from 'react';
import {
  Sliders,
  Terminal,
  Settings,
  ShieldAlert,
  RotateCcw
} from 'lucide-react';
import { SystemStatus } from '../../electron/types';

interface HeaderProps {
  systemStatus: SystemStatus | null;
  onOpenPresets: () => void;
  onOpenLogs: () => void;
  onOpenSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  systemStatus,
  onOpenPresets,
  onOpenLogs,
  onOpenSettings
}) => {
  const isNonAdmin = systemStatus !== null && !systemStatus.isAdmin;

  const handleRelaunchAdmin = () => {
    window.api?.relaunchAsAdmin();
  };

  return (
    <>
      {/* Non-Admin Top Warning Banner */}
      {isNonAdmin && (
        <div className="admin-warning-banner">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldAlert size={15} color="#ef4444" />
            <span>Aplikasi sedang berjalan tanpa hak Administrator. Beberapa software dan driver mungkin gagal dipasang.</span>
          </div>
          <button className="admin-warning-btn" onClick={handleRelaunchAdmin}>
            <RotateCcw size={12} /> Jalankan ulang sebagai Admin
          </button>
        </div>
      )}

      <header className="top-header">
        <div className="brand-section">
          <img src="/logo.png" alt="Kickstart" className="brand-logo-img" />
          <div className="app-title-group">
            <h1>
              Kickstart
              <span className="app-title-subtitle">Fresh Windows, ready in minutes</span>
            </h1>
          </div>
        </div>

        <div className="diagnostics-bar">
          {/* Unified Thin Status Line */}
          {systemStatus && (
            <div className="status-line">
              <span className="status-dot-item" title={systemStatus.isAdmin ? 'Akses Administrator Aktif' : 'Non-Admin'}>
                <span className={`status-dot ${systemStatus.isAdmin ? 'green' : 'danger'}`} />
                <span>{systemStatus.isAdmin ? 'Admin' : 'Non-Admin'}</span>
              </span>

              <span className="status-dot-item" title={systemStatus.hasWinget ? `Winget ${systemStatus.wingetVersion || ''}` : 'Winget tidak ditemukan'}>
                <span className={`status-dot ${systemStatus.hasWinget ? 'green' : 'danger'}`} />
                <span>{systemStatus.hasWinget ? 'Winget' : 'No Winget'}</span>
              </span>

              <span className="status-dot-item" title={systemStatus.hasInternet ? 'Terhubung ke Internet' : 'Offline'}>
                <span className={`status-dot ${systemStatus.hasInternet ? 'green' : 'danger'}`} />
                <span>{systemStatus.hasInternet ? 'Online' : 'Offline'}</span>
              </span>

              {systemStatus.diskTotalGB > 0 && (
                <span className="status-dot-item" title={`Drive C: Sisa ${systemStatus.diskFreeGB} GB dari total ${systemStatus.diskTotalGB} GB`}>
                  <span className={`status-dot ${systemStatus.diskFreeGB > 15 ? 'green' : 'danger'}`} />
                  <span className="mono-version">C: {systemStatus.diskFreeGB} GB</span>
                </span>
              )}
            </div>
          )}

          {/* Icon-only Actions: Preset, Log, Settings */}
          <div className="header-actions">
            <button className="btn-icon" onClick={onOpenPresets} title="Profil Preset">
              <Sliders size={15} />
            </button>
            <button className="btn-icon" onClick={onOpenLogs} title="Terminal Log">
              <Terminal size={15} />
            </button>
            <button className="btn-icon" onClick={onOpenSettings} title="Pengaturan">
              <Settings size={15} />
            </button>
          </div>
        </div>
      </header>
    </>
  );
};
