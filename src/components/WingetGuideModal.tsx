import React from 'react';
import { X, ExternalLink, PackageCheck, AlertCircle } from 'lucide-react';
import { i18n } from '../i18n';

interface WingetGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WingetGuideModal: React.FC<WingetGuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const handleOpenStore = () => {
    window.api?.openExternal('ms-windows-store://pdp/?productid=9NBLGGH4NNS1');
  };

  const handleOpenGithub = () => {
    window.api?.openExternal('https://github.com/microsoft/winget-cli/releases/latest');
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '520px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--warning)' }}>
            <AlertCircle size={20} />
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff' }}>
              {i18n.wingetGuideTitle}
            </h2>
          </div>
          <button className="btn-secondary" onClick={onClose} style={{ padding: '4px 8px' }}>
            <X size={16} />
          </button>
        </div>

        <div className="modal-body">
          <p style={{ color: 'var(--text-main)', fontSize: '0.88rem', marginBottom: '14px' }}>
            {i18n.wingetGuideText}
          </p>

          <div
            style={{
              background: 'rgba(0, 212, 255, 0.05)',
              border: '1px solid rgba(0, 212, 255, 0.2)',
              borderRadius: '8px',
              padding: '14px',
              marginBottom: '16px',
              fontSize: '0.82rem',
              color: 'var(--text-dim)'
            }}
          >
            <strong style={{ color: 'var(--cyan)', display: 'block', marginBottom: '6px' }}>
              Pilihan Paling Cepat:
            </strong>
            1. Buka <strong>Microsoft Store</strong> lalu cari paket <em>"App Installer"</em> (Penginstal Aplikasi).<br />
            2. Klik Update atau Pasang.<br />
            3. Atau unduh bundle <code>.msixbundle</code> terbaru langsung dari GitHub resmi Microsoft.
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              className="btn-primary"
              style={{ flex: 1, justifyContent: 'center' }}
              onClick={handleOpenStore}
            >
              <PackageCheck size={16} /> {i18n.openStoreLink}
            </button>
            <button
              className="btn-secondary"
              style={{ flex: 1, justifyContent: 'center' }}
              onClick={handleOpenGithub}
            >
              <ExternalLink size={16} /> {i18n.openGithubWinget}
            </button>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>
            {i18n.closeBtn}
          </button>
        </div>
      </div>
    </div>
  );
};
