import React, { useState } from 'react';
import {
  X,
  Settings,
  Check,
  Shield,
  Info,
  ExternalLink
} from 'lucide-react';
import { AppConfig } from '../../electron/types';
import { i18n } from '../i18n';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: AppConfig;
  onSaveConfig: (updated: Partial<AppConfig>) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  config,
  onSaveConfig
}) => {
  const [maxParallel, setMaxParallel] = useState(config.maxParallel || 2);
  const [skipInstalled, setSkipInstalled] = useState(config.skipAlreadyInstalled ?? true);
  const [retryCount, setRetryCount] = useState(config.autoRetryCount || 3);
  const [saved, setSaved] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    onSaveConfig({
      maxParallel,
      skipAlreadyInstalled: skipInstalled,
      autoRetryCount: retryCount
    });
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 400);
  };

  const handleOpenAuthor = () => {
    window.api?.openExternal('https://instagram.com/ikifer');
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '460px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Settings size={16} color="var(--purple)" />
            <h2 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>
              Pengaturan & About
            </h2>
          </div>
          <button className="btn-icon" onClick={onClose} style={{ width: '28px', height: '28px' }}>
            <X size={14} />
          </button>
        </div>

        <div className="modal-body">
          <div className="form-group">
            <label className="form-label">{i18n.parallelSettings}</label>
            <p style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '8px' }}>
              Jumlah aplikasi yang diunduh dan dipasang bersamaan (default 2).
            </p>
            <div style={{ display: 'flex', gap: '6px' }}>
              {[1, 2, 3].map((num) => (
                <button
                  key={num}
                  type="button"
                  className="btn-secondary"
                  style={{
                    flex: 1,
                    justifyContent: 'center',
                    borderColor: maxParallel === num ? 'var(--green)' : undefined,
                    color: maxParallel === num ? 'var(--green)' : undefined,
                    background: maxParallel === num ? 'var(--surface-2)' : undefined
                  }}
                  onClick={() => setMaxParallel(num)}
                >
                  {num} Proses
                </button>
              ))}
            </div>
          </div>

          <div className="form-group" style={{ marginTop: '16px' }}>
            <label className="form-label">Auto Retry Unduhan</label>
            <div style={{ display: 'flex', gap: '6px' }}>
              {[1, 2, 3, 5].map((num) => (
                <button
                  key={num}
                  type="button"
                  className="btn-secondary"
                  style={{
                    flex: 1,
                    justifyContent: 'center',
                    borderColor: retryCount === num ? 'var(--blue)' : undefined,
                    color: retryCount === num ? 'var(--blue)' : undefined,
                    background: retryCount === num ? 'var(--surface-2)' : undefined
                  }}
                  onClick={() => setRetryCount(num)}
                >
                  {num}x
                </button>
              ))}
            </div>
          </div>

          <div className="form-group" style={{ marginTop: '16px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={skipInstalled}
                onChange={(e) => setSkipInstalled(e.target.checked)}
                style={{ width: '16px', height: '16px', accentColor: 'var(--green)' }}
              />
              <span style={{ fontSize: '13px', color: 'var(--text)' }}>
                {i18n.skipInstalledLabel}
              </span>
            </label>
          </div>

          {/* About Kickstart Section */}
          <div
            style={{
              marginTop: '20px',
              paddingTop: '16px',
              borderTop: '1px solid var(--border)',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <img src="/logo.png" alt="Kickstart" style={{ width: '24px', height: '24px', borderRadius: '4px' }} />
              <div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)' }}>Kickstart v1.0.0</div>
                <div style={{ fontSize: '12px', color: 'var(--muted)' }}>Fresh Windows, ready in minutes</div>
              </div>
            </div>

            <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>
              {i18n.creditFull}
            </p>

            <div style={{ marginTop: '4px' }}>
              <span
                style={{
                  fontSize: '12px',
                  color: 'var(--blue)',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
                onClick={handleOpenAuthor}
              >
                {i18n.credit} <ExternalLink size={11} />
              </span>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>
            Batal
          </button>
          <button className="btn-primary" onClick={handleSave}>
            {saved ? <Check size={14} /> : null}
            {saved ? 'Tersimpan!' : 'Simpan Pengaturan'}
          </button>
        </div>
      </div>
    </div>
  );
};
