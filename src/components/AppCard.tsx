import React from 'react';
import { Check } from 'lucide-react';
import { AppItem, InstalledAppInfo } from '../../electron/types';
import { BrandIcon } from './BrandIcon';

interface AppCardProps {
  app: AppItem;
  isSelected: boolean;
  onToggle: (appId: string) => void;
  installedInfo?: InstalledAppInfo;
}

export const AppCard: React.FC<AppCardProps> = ({
  app,
  isSelected,
  onToggle,
  installedInfo
}) => {
  const isInstalled = Boolean(installedInfo?.installed);
  const hasUpdate = Boolean(installedInfo?.hasUpdate);

  return (
    <div
      className={`app-card ${isSelected ? 'selected' : ''}`}
      onClick={() => onToggle(app.id)}
    >
      <div className="card-top">
        <BrandIcon appName={app.nama} category={app.kategori} size={24} />

        <div className="app-info">
          <h3>{app.nama}</h3>
          <p>{app.deskripsi}</p>
        </div>

        <div className="custom-checkbox">
          {isSelected && <Check size={13} strokeWidth={3} />}
        </div>
      </div>

      {(isInstalled || hasUpdate || app.kategori === 'Creative (ArtCraft)') && (
        <div className="card-status-line">
          {hasUpdate ? (
            <span className="status-tag update">
              <span className="status-dot blue" /> Update tersedia {installedInfo?.version || ''}
            </span>
          ) : isInstalled ? (
            <span className="status-tag installed">
              <span className="status-dot green" /> Terinstall {installedInfo?.version ? <span className="mono-version">{installedInfo.version}</span> : ''}
            </span>
          ) : null}

          {app.kategori === 'Creative (ArtCraft)' && !isInstalled && (
            <span className="status-tag purple">
              <span className="status-dot purple" /> ArtCraft Suite
            </span>
          )}
        </div>
      )}
    </div>
  );
};
