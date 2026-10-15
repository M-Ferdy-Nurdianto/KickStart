import React from 'react';
import {
  X,
  CheckCircle2,
  AlertCircle,
  Clock,
  Download,
  ShieldCheck,
  Ban,
  RotateCcw,
  Zap
} from 'lucide-react';
import { AppItem, InstallProgress } from '../../electron/types';
import { QueueSummary } from '../../electron/modules/installerQueue';
import { i18n } from '../i18n';

interface QueueModalProps {
  isOpen: boolean;
  onClose: () => void;
  apps: AppItem[];
  progressMap: Record<string, InstallProgress>;
  summary: QueueSummary | null;
  isRunning: boolean;
  onCancelApp: (appId: string) => void;
  onCancelAll: () => void;
  onRetryFailed: (failedIds: string[]) => void;
}

export const QueueModal: React.FC<QueueModalProps> = ({
  isOpen,
  onClose,
  apps,
  progressMap,
  summary,
  isRunning,
  onCancelApp,
  onCancelAll,
  onRetryFailed
}) => {
  if (!isOpen) return null;

  // Calculate overall progress
  const appList = Object.values(progressMap);
  const totalCount = appList.length;
  let overallPercent = 0;
  if (totalCount > 0) {
    const sum = appList.reduce((acc, curr) => acc + (curr.percentage || 0), 0);
    overallPercent = Math.round(sum / totalCount);
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 size={16} className="text-green" color="#00ff88" />;
      case 'failed':
        return <AlertCircle size={16} className="text-danger" color="#ff4757" />;
      case 'downloading':
        return <Download size={16} className="text-cyan" color="#00d4ff" />;
      case 'verifying':
        return <ShieldCheck size={16} color="#c084fc" />;
      case 'installing':
        return <Zap size={16} color="#fbbf24" />;
      case 'cancelled':
        return <Ban size={16} color="#94a3b8" />;
      default:
        return <Clock size={16} color="#64748b" />;
    }
  };

  const getStatusText = (p: InstallProgress) => {
    if (p.message) return p.message;
    if (p.error) return p.error;
    switch (p.status) {
      case 'completed':
        return i18n.status.completed;
      case 'failed':
        return i18n.status.failed;
      case 'downloading':
        return i18n.status.downloading;
      case 'verifying':
        return i18n.status.verifying;
      case 'installing':
        return i18n.status.installing;
      case 'cancelled':
        return i18n.status.cancelled;
      case 'skipped':
        return i18n.status.skipped;
      default:
        return i18n.status.queued;
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '720px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff' }}>
              {i18n.queueTitle} ({appList.length} Aplikasi)
            </h2>
            {isRunning && (
              <span className="badge-tag badge-installed" style={{ animation: 'pulse 1.5s infinite' }}>
                Sedang Memproses...
              </span>
            )}
          </div>
          <button className="btn-secondary" onClick={onClose} style={{ padding: '4px 8px' }}>
            <X size={16} />
          </button>
        </div>

        <div className="modal-body">
          {/* Overall Progress Bar */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.85rem' }}>
              <span style={{ color: 'var(--text-dim)' }}>Progress Keseluruhan</span>
              <span style={{ color: 'var(--green)', fontWeight: 700 }}>{overallPercent}%</span>
            </div>
            <div className="progress-track" style={{ height: '8px' }}>
              <div className="progress-fill" style={{ width: `${overallPercent}%` }} />
            </div>
          </div>

          {/* Queue Items */}
          <div style={{ maxHeight: '380px', overflowY: 'auto', paddingRight: '4px' }}>
            {Object.keys(progressMap).map((appId) => {
              const progress = progressMap[appId];
              const app = apps.find((a) => a.id === appId);
              if (!progress || !app) return null;

              const isFinished =
                progress.status === 'completed' ||
                progress.status === 'failed' ||
                progress.status === 'skipped' ||
                progress.status === 'cancelled';

              return (
                <div key={appId} className="queue-item">
                  <div className="queue-row">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {getStatusIcon(progress.status)}
                      <strong style={{ color: '#f1f5f9', fontSize: '0.9rem' }}>{app.nama}</strong>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-dark)' }}>({app.kategori})</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span
                        style={{
                          fontSize: '0.78rem',
                          color:
                            progress.status === 'completed'
                              ? 'var(--green)'
                              : progress.status === 'failed'
                              ? 'var(--danger)'
                              : 'var(--text-dim)'
                        }}
                      >
                        {progress.percentage}%
                      </span>

                      {!isFinished && isRunning && (
                        <button
                          className="btn-danger"
                          onClick={() => onCancelApp(appId)}
                          style={{ padding: '2px 6px', fontSize: '0.7rem' }}
                          title="Batalkan item ini"
                        >
                          <Ban size={12} /> Batal
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Progress Bar for Item */}
                  <div className="progress-track">
                    <div
                      className="progress-fill"
                      style={{
                        width: `${progress.percentage}%`,
                        background:
                          progress.status === 'failed'
                            ? 'var(--danger)'
                            : progress.status === 'completed'
                            ? 'var(--green)'
                            : undefined
                      }}
                    />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-dark)' }}>
                    <span>{getStatusText(progress)}</span>
                    {progress.downloadSpeedMBps && progress.downloadSpeedMBps > 0 && (
                      <span>
                        {progress.downloadSpeedMBps} MB/s {progress.etaSeconds ? `| ETA: ${progress.etaSeconds}s` : ''}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Final Summary Card when finished */}
          {summary && !isRunning && (
            <div
              style={{
                marginTop: '16px',
                padding: '14px',
                borderRadius: '8px',
                background: 'rgba(0, 212, 255, 0.05)',
                border: '1px solid rgba(0, 212, 255, 0.2)'
              }}
            >
              <h4 style={{ color: 'var(--cyan)', marginBottom: '6px', fontSize: '0.9rem' }}>
                🎉 Ringkasan Akhir Instalasi
              </h4>
              <div style={{ display: 'flex', gap: '16px', fontSize: '0.82rem', color: '#f1f5f9' }}>
                <span>
                  Berhasil: <strong style={{ color: 'var(--green)' }}>{summary.completed}</strong>
                </span>
                <span>
                  Gagal: <strong style={{ color: 'var(--danger)' }}>{summary.failed}</strong>
                </span>
                <span>
                  Dilewati: <strong style={{ color: 'var(--text-dim)' }}>{summary.skipped}</strong>
                </span>
                <span>
                  Dibatalkan: <strong style={{ color: 'var(--warning)' }}>{summary.cancelled}</strong>
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          {summary && summary.failedAppIds && summary.failedAppIds.length > 0 && !isRunning && (
            <button
              className="btn-secondary"
              onClick={() => onRetryFailed(summary.failedAppIds)}
              style={{ borderColor: 'var(--warning)', color: 'var(--warning)' }}
            >
              <RotateCcw size={14} /> {i18n.retryFailedBtn} ({summary.failedAppIds.length})
            </button>
          )}

          {isRunning ? (
            <button className="btn-danger" onClick={onCancelAll}>
              <Ban size={14} /> {i18n.cancelAllBtn}
            </button>
          ) : (
            <button className="btn-primary" onClick={onClose}>
              {i18n.closeBtn}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
