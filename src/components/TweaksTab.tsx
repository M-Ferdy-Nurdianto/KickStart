import React, { useState, useEffect, useRef } from 'react';
import {
  Trash2,
  Moon,
  Sun,
  ShieldAlert,
  FileCheck,
  Wrench,
  UserPlus,
  HardDrive,
  Info,
  Terminal,
  Loader2,
  AlertTriangle
} from 'lucide-react';
import { i18n } from '../i18n';

export const TweaksTab: React.FC = () => {
  const [runningTweak, setRunningTweak] = useState<string | null>(null);
  const [terminalOutput, setTerminalOutput] = useState<string[]>([]);
  const terminalBottomRef = useRef<HTMLDivElement>(null);

  // Form states
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isNewAdmin, setIsNewAdmin] = useState(true);
  const [selectedDrive, setSelectedDrive] = useState('C');

  // Confirmation modal for risky actions
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

  useEffect(() => {
    // Listen for streaming output from tweaks
    const unsubscribe = window.api?.onTweakOutput((text) => {
      setTerminalOutput((prev) => [...prev, text]);
    });
    return () => unsubscribe?.();
  }, []);

  useEffect(() => {
    terminalBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [terminalOutput]);

  const executeTweak = async (tweakId: string, params: Record<string, any> = {}) => {
    if (runningTweak) return;
    setRunningTweak(tweakId);
    setTerminalOutput((prev) => [
      ...prev,
      `\r\n>>> [${new Date().toLocaleTimeString()}] Menjalankan aksi: ${tweakId}...\r\n`
    ]);

    try {
      const res = await window.api?.runTweak(tweakId, params);
      if (res?.success) {
        setTerminalOutput((prev) => [
          ...prev,
          `\r\n>>> [SUKSES] Aksi ${tweakId} berhasil diselesaikan!\r\n`
        ]);
      } else {
        setTerminalOutput((prev) => [
          ...prev,
          `\r\n>>> [GAGAL] ${res?.error || 'Terjadi kesalahan saat menjalankan perintah.'}\r\n`
        ]);
      }
    } catch (err: any) {
      setTerminalOutput((prev) => [...prev, `\r\n>>> [ERROR] ${err.message}\r\n`]);
    } finally {
      setRunningTweak(null);
    }
  };

  const handleRiskyAction = (
    title: string,
    description: string,
    action: () => void
  ) => {
    setConfirmDialog({
      isOpen: true,
      title,
      description,
      onConfirm: () => {
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        action();
      }
    });
  };

  const handleAddUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername.trim()) return;

    executeTweak('adduser', {
      username: newUsername.trim(),
      password: newPassword,
      makeAdmin: isNewAdmin
    });

    setNewUsername('');
    setNewPassword('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff', marginBottom: '4px' }}>
          {i18n.tweaks.title}
        </h2>
        <p style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>
          {i18n.tweaks.subtitle}
        </p>
      </div>

      {/* Grid of Tweak Action Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
        {/* Clean Temp & Cache */}
        <div className="app-card">
          <div className="card-top">
            <div className="app-icon-wrap" style={{ color: 'var(--green)' }}>
              <Trash2 size={20} />
            </div>
            <div className="app-info">
              <h3>{i18n.tweaks.cleanTemp}</h3>
              <p>{i18n.tweaks.cleanTempDesc}</p>
            </div>
          </div>
          <button
            className="btn-primary"
            style={{ width: '100%', justifyContent: 'center' }}
            disabled={runningTweak !== null}
            onClick={() => executeTweak('cleaner')}
          >
            {runningTweak === 'cleaner' ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
            Bersihkan Sekarang
          </button>
        </div>

        {/* Hibernation Control */}
        <div className="app-card">
          <div className="card-top">
            <div style={{ color: 'var(--purple)' }}>
              <Moon size={18} />
            </div>
            <div className="app-info">
              <h3>Hibernasi Windows (powercfg)</h3>
              <p>Matikan untuk menghapus file hiberfil.sys dan menghemat puluhan GB ruang disk C:.</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              className="btn-secondary"
              style={{ flex: 1, justifyContent: 'center' }}
              disabled={runningTweak !== null}
              onClick={() => executeTweak('hibernation_on')}
            >
              <Sun size={13} /> Aktifkan
            </button>
            <button
              className="btn-secondary"
              style={{ flex: 1, justifyContent: 'center', borderColor: 'var(--purple)', color: 'var(--purple)' }}
              disabled={runningTweak !== null}
              onClick={() => executeTweak('hibernation_off')}
            >
              <Moon size={13} /> Matikan
            </button>
          </div>
        </div>

        {/* Clear Event Logs (Risky) */}
        <div className="app-card">
          <div className="card-top">
            <div style={{ color: 'var(--muted)' }}>
              <ShieldAlert size={18} />
            </div>
            <div className="app-info">
              <h3>{i18n.tweaks.eventLogClear}</h3>
              <p>{i18n.tweaks.eventLogDesc}</p>
            </div>
          </div>
          <button
            className="btn-danger"
            style={{ width: '100%', justifyContent: 'center' }}
            disabled={runningTweak !== null}
            onClick={() =>
              handleRiskyAction(
                'Hapus Log Event Viewer',
                'Aksi ini akan menghapus semua catatan riwayat sistem di Windows Event Viewer secara permanen.',
                () => executeTweak('eventlog')
              )
            }
          >
            Bersihkan Log (Konfirmasi)
          </button>
        </div>

        {/* Windows Update Service (Risky) */}
        <div className="app-card">
          <div className="card-top">
            <div style={{ color: 'var(--muted)' }}>
              <AlertTriangle size={18} />
            </div>
            <div className="app-info">
              <h3>Windows Update Service</h3>
              <p>Kelola service Windows Update (wuauserv & UsoSvc) agar tidak membebani bandwidth.</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              className="btn-danger"
              style={{ flex: 1, justifyContent: 'center' }}
              disabled={runningTweak !== null}
              onClick={() =>
                handleRiskyAction(
                  'Matikan Windows Update',
                  'Mematikan update otomatis dapat membuat sistem rentan jika tidak diperbarui berkala.',
                  () => executeTweak('windows_update_off')
                )
              }
            >
              Matikan
            </button>
            <button
              className="btn-secondary"
              style={{ flex: 1, justifyContent: 'center', borderColor: 'var(--green)', color: 'var(--green)' }}
              disabled={runningTweak !== null}
              onClick={() => executeTweak('windows_update_on')}
            >
              Aktifkan
            </button>
          </div>
        </div>

        {/* SFC Scan */}
        <div className="app-card">
          <div className="card-top">
            <div className="app-icon-wrap" style={{ color: 'var(--green)' }}>
              <FileCheck size={20} />
            </div>
            <div className="app-info">
              <h3>{i18n.tweaks.sfcTitle}</h3>
              <p>{i18n.tweaks.sfcDesc}</p>
            </div>
          </div>
          <button
            className="btn-secondary"
            style={{ width: '100%', justifyContent: 'center' }}
            disabled={runningTweak !== null}
            onClick={() => executeTweak('sfc')}
          >
            {runningTweak === 'sfc' ? <Loader2 size={16} className="animate-spin" /> : <FileCheck size={16} />}
            Jalankan sfc /scannow
          </button>
        </div>

        {/* DISM Scan */}
        <div className="app-card">
          <div className="card-top">
            <div className="app-icon-wrap" style={{ color: 'var(--cyan)' }}>
              <Wrench size={20} />
            </div>
            <div className="app-info">
              <h3>{i18n.tweaks.dismTitle}</h3>
              <p>{i18n.tweaks.dismDesc}</p>
            </div>
          </div>
          <button
            className="btn-secondary"
            style={{ width: '100%', justifyContent: 'center' }}
            disabled={runningTweak !== null}
            onClick={() => executeTweak('dism')}
          >
            {runningTweak === 'dism' ? <Loader2 size={16} className="animate-spin" /> : <Wrench size={16} />}
            Jalankan DISM RestoreHealth
          </button>
        </div>

        {/* Disk Cleanup */}
        <div className="app-card">
          <div className="card-top">
            <div className="app-icon-wrap" style={{ color: 'var(--cyan)' }}>
              <HardDrive size={20} />
            </div>
            <div className="app-info">
              <h3>{i18n.tweaks.diskCleanupTitle}</h3>
              <p>Buka wizard cleanmgr resmi Windows untuk drive tertentu.</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <select
              className="form-input"
              style={{ width: '90px' }}
              value={selectedDrive}
              onChange={(e) => setSelectedDrive(e.target.value)}
            >
              <option value="C">Drive C:</option>
              <option value="D">Drive D:</option>
              <option value="E">Drive E:</option>
              <option value="F">Drive F:</option>
            </select>
            <button
              className="btn-secondary"
              style={{ flex: 1, justifyContent: 'center' }}
              onClick={() => executeTweak('diskcleanup', { drive: selectedDrive })}
            >
              Buka Cleanmgr
            </button>
          </div>
        </div>

        {/* System Info Report */}
        <div className="app-card">
          <div className="card-top">
            <div className="app-icon-wrap" style={{ color: 'var(--cyan)' }}>
              <Info size={20} />
            </div>
            <div className="app-info">
              <h3>{i18n.tweaks.sysinfoTitle}</h3>
              <p>Dapatkan laporan lengkap hardware, BIOS, OS, hotfix, dan kartu jaringan.</p>
            </div>
          </div>
          <button
            className="btn-secondary"
            style={{ width: '100%', justifyContent: 'center' }}
            disabled={runningTweak !== null}
            onClick={() => executeTweak('sysinfo')}
          >
            {runningTweak === 'sysinfo' ? <Loader2 size={16} className="animate-spin" /> : <Info size={16} />}
            Tampilkan System Info
          </button>
        </div>
      </div>

      {/* Add New User & Admin Form */}
      <div
        className="app-card"
        style={{ background: 'var(--bg-panel)', border: '1px solid rgba(0, 212, 255, 0.2)' }}
      >
        <div className="card-top">
          <div className="app-icon-wrap" style={{ color: 'var(--green)' }}>
            <UserPlus size={20} />
          </div>
          <div className="app-info">
            <h3>{i18n.tweaks.addUserTitle}</h3>
            <p>{i18n.tweaks.addUserDesc}</p>
          </div>
        </div>

        <form onSubmit={handleAddUserSubmit} style={{ marginTop: '12px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto auto', gap: '10px', alignItems: 'flex-end' }}>
            <div>
              <label className="form-label">Nama Pengguna Baru</label>
              <input
                type="text"
                className="form-input"
                placeholder="misal: Programmer"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="form-label">Password (Disembunyikan)</label>
              <input
                type="password"
                className="form-input"
                placeholder="Kosongkan jika tanpa password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <div style={{ paddingBottom: '8px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={isNewAdmin}
                  onChange={(e) => setIsNewAdmin(e.target.checked)}
                />
                Hak Administrator
              </label>
            </div>
            <div>
              <button
                type="submit"
                className="btn-primary"
                style={{ padding: '8px 16px' }}
                disabled={runningTweak !== null || !newUsername.trim()}
              >
                Buat User
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Live Terminal Output for Tweaks */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Terminal size={14} color="var(--green)" /> Console Output Pemeliharaan
          </span>
          <button
            className="btn-secondary"
            style={{ padding: '2px 8px', fontSize: '0.72rem' }}
            onClick={() => setTerminalOutput([])}
          >
            Bersihkan Output
          </button>
        </div>
        <div className="terminal-viewer">
          {terminalOutput.length === 0 ? (
            <div style={{ color: 'var(--text-dark)' }}>
              Klik salah satu tombol pemeliharaan di atas untuk melihat proses console langsung di sini...
            </div>
          ) : (
            terminalOutput.map((chunk, idx) => (
              <span key={idx} className="terminal-line">
                {chunk}
              </span>
            ))
          )}
          <div ref={terminalBottomRef} />
        </div>
      </div>

      {/* Confirmation Dialog Modal */}
      {confirmDialog.isOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '440px' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--warning)' }}>
                <AlertTriangle size={18} />
                <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>{confirmDialog.title}</h3>
              </div>
            </div>
            <div className="modal-body">
              <p style={{ color: 'var(--text-main)', fontSize: '0.88rem' }}>
                {confirmDialog.description}
              </p>
              <p style={{ color: 'var(--danger)', fontSize: '0.78rem', marginTop: '10px' }}>
                {i18n.tweaks.riskyWarning}
              </p>
            </div>
            <div className="modal-footer">
              <button
                className="btn-secondary"
                onClick={() => setConfirmDialog((prev) => ({ ...prev, isOpen: false }))}
              >
                Batal
              </button>
              <button className="btn-danger" onClick={confirmDialog.onConfirm}>
                Ya, Lanjutkan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
