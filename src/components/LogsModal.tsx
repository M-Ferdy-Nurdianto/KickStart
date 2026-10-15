import React, { useState, useEffect, useRef } from 'react';
import { X, Copy, Download, Trash2, Check } from 'lucide-react';
import { i18n } from '../i18n';

interface LogsModalProps {
  isOpen: boolean;
  onClose: () => void;
  logs: string[];
  onClearLogs: () => void;
}

export const LogsModal: React.FC<LogsModalProps> = ({
  isOpen,
  onClose,
  logs,
  onClearLogs
}) => {
  const [copied, setCopied] = useState(false);
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [isOpen, logs]);

  if (!isOpen) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(logs.join('\n'));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy logs:', err);
    }
  };

  const handleSaveToFile = async () => {
    const res = await window.api?.saveLogsToFile();
    if (res?.success) {
      alert(`Log berhasil disimpan ke: ${res.path}`);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '800px', height: '80vh' }}>
        <div className="modal-header">
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff' }}>
            {i18n.logsTitle} ({logs.length} baris)
          </h2>
          <button className="btn-secondary" onClick={onClose} style={{ padding: '4px 8px' }}>
            <X size={16} />
          </button>
        </div>

        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="terminal-viewer" style={{ flex: 1, height: 'auto', minHeight: '300px' }}>
            {logs.length === 0 ? (
              <div style={{ color: 'var(--text-dark)' }}>Belum ada log tercatat.</div>
            ) : (
              logs.map((line, idx) => {
                let lineClass = 'terminal-line';
                if (line.includes('[ERROR]') || line.includes('Gagal')) lineClass += ' error';
                else if (line.includes('[WARN]')) lineClass += ' warn';
                else if (line.includes('[SUCCESS]') || line.includes('Berhasil')) lineClass += ' success';
                else if (line.includes('[INFO]')) lineClass += ' info';

                return (
                  <div key={idx} className={lineClass}>
                    {line}
                  </div>
                );
              })
            )}
            <div ref={logEndRef} />
          </div>
        </div>

        <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
          <button className="btn-secondary" onClick={onClearLogs}>
            <Trash2 size={14} /> {i18n.clearLogs}
          </button>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn-secondary" onClick={handleCopy}>
              {copied ? <Check size={14} color="var(--green)" /> : <Copy size={14} />}
              {copied ? i18n.copiedSuccess : i18n.copyLogs}
            </button>

            <button className="btn-secondary" onClick={handleSaveToFile}>
              <Download size={14} /> {i18n.saveLogs}
            </button>

            <button className="btn-primary" onClick={onClose}>
              {i18n.closeBtn}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
