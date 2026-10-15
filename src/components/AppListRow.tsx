import React from 'react';
import { Check } from 'lucide-react';
import { AppItem, InstalledAppInfo } from '../../electron/types';
import { BrandIcon } from './BrandIcon';

interface AppListRowProps {
  app: AppItem;
  isSelected: boolean;
  onToggle: (appId: string) => void;
  installedInfo?: InstalledAppInfo;
}

export const AppListRow: React.FC<AppListRowProps> = ({
  app,
  isSelected,
  onToggle,
  installedInfo
}) => {
  const isInstalled = Boolean(installedInfo?.installed);
  const hasUpdate = Boolean(installedInfo?.hasUpdate);

  return (
    <div
      className={`list-row ${isSelected ? 'selected' : ''}`}
      onClick={() => onToggle(app.id)}
    >
      <div className="custom-checkbox">
        {isSelected && <Check size={12} strokeWidth={3} />}
      </div>

      <BrandIcon appName={app.nama} category={app.kategori} size={18} />

      <div style={{ fontWeight: 500, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {app.nama}
      </div>

      <div className="mono-version" style={{ color: 'var(--muted)', fontSize: '12px' }}>
        {installedInfo?.version || '-'}
      </div>

      <div>
        {hasUpdate ? (
          <span className="status-tag update">
            <span className="status-dot blue" /> Update tersedia
          </span>
        ) : isInstalled ? (
          <span className="status-tag installed">
            <span className="status-dot green" /> Terinstall
          </span>
        ) : (
          <span style={{ color: 'var(--muted)', fontSize: '12px' }}>Belum terpasang</span>
        )}
      </div>

      <div style={{ color: 'var(--muted)', fontSize: '12px', textAlign: 'right' }}>
        {app.source === 'github-release' ? '~150 MB' : '~100 MB'}
      </div>
    </div>
  );
};
