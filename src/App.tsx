import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  CheckSquare,
  Square,
  Play,
  LayoutGrid,
  List,
  Loader2
} from 'lucide-react';
import {
  AppItem,
  InstalledAppInfo,
  InstallProgress,
  PresetProfile,
  SystemStatus,
  AppConfig
} from '../electron/types';
import { QueueSummary } from '../electron/modules/installerQueue';
import { Header } from './components/Header';
import { Sidebar, CategoryFilter } from './components/Sidebar';
import { AppCard } from './components/AppCard';
import { AppListRow } from './components/AppListRow';
import { DriverCenterTab } from './components/DriverCenterTab';
import { QueueModal } from './components/QueueModal';
import { PresetsModal } from './components/PresetsModal';
import { TweaksTab } from './components/TweaksTab';
import { LogsModal } from './components/LogsModal';
import { SettingsModal } from './components/SettingsModal';
import { WingetGuideModal } from './components/WingetGuideModal';
import { i18n } from './i18n';

type FilterType = 'all' | 'not-installed' | 'selected';
type ViewMode = 'list' | 'grid';

export const App: React.FC = () => {
  // State
  const [apps, setApps] = useState<AppItem[]>([]);
  const [presets, setPresets] = useState<PresetProfile[]>([]);
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [installedMap, setInstalledMap] = useState<Record<string, InstalledAppInfo>>({});
  const [config, setConfig] = useState<AppConfig>({
    maxParallel: 2,
    skipAlreadyInstalled: true,
    theme: 'hacker-dark',
    autoRetryCount: 3,
    viewMode: 'list'
  });
  const [logs, setLogs] = useState<string[]>([]);

  // Selection & Filtering
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [selectedAppIds, setSelectedAppIds] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('list'); // Default: List mode

  // Queue & Progress
  const [isQueueRunning, setIsQueueRunning] = useState(false);
  const [progressMap, setProgressMap] = useState<Record<string, InstallProgress>>({});
  const [queueSummary, setQueueSummary] = useState<QueueSummary | null>(null);

  // Modals
  const [showQueueModal, setShowQueueModal] = useState(false);
  const [showPresetsModal, setShowPresetsModal] = useState(false);
  const [showLogsModal, setShowLogsModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showWingetGuideModal, setShowWingetGuideModal] = useState(false);

  // Initial Load
  useEffect(() => {
    async function init() {
      try {
        if (!window.api) return;

        const [loadedApps, loadedPresets, status, cfg, initialLogs] = await Promise.all([
          window.api.getApps(),
          window.api.getPresets(),
          window.api.getSystemStatus(),
          window.api.getConfig(),
          window.api.getLogs()
        ]);

        setApps(loadedApps || []);
        setPresets(loadedPresets || []);
        setSystemStatus(status);
        if (cfg) {
          setConfig(cfg);
          if (cfg.viewMode) {
            setViewMode(cfg.viewMode);
          }
        }
        setLogs(initialLogs || []);

        // Detect installed apps in the background
        window.api.checkInstalledApps().then((installed) => {
          setInstalledMap(installed || {});
        });
      } catch (err) {
        console.error('Initialization error:', err);
      }
    }

    init();
  }, []);

  // Persist view mode changes
  const handleToggleViewMode = (mode: ViewMode) => {
    setViewMode(mode);
    window.api?.saveConfig({ viewMode: mode });
  };

  // Event Subscriptions
  useEffect(() => {
    if (!window.api) return;

    const unsubProgress = window.api.onInstallProgress((progress) => {
      setProgressMap((prev) => ({
        ...prev,
        [progress.appId]: progress
      }));
    });

    const unsubLog = window.api.onLogEntry((line) => {
      setLogs((prev) => [...prev, line]);
    });

    const unsubFinished = window.api.onQueueFinished((summary) => {
      setIsQueueRunning(false);
      setQueueSummary(summary);
      setShowQueueModal(true);

      // Refresh detection
      window.api.checkInstalledApps(true).then((installed) => {
        setInstalledMap(installed || {});
      });
    });

    return () => {
      unsubProgress?.();
      unsubLog?.();
      unsubFinished?.();
    };
  }, []);

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { total: apps.length };
    for (const app of apps) {
      counts[app.kategori] = (counts[app.kategori] || 0) + 1;
    }
    return counts;
  }, [apps]);

  // Filtered Apps
  const filteredApps = useMemo(() => {
    return apps.filter((app) => {
      // Category filter
      if (activeCategory !== 'all' && activeCategory !== 'Tweaks' && activeCategory !== 'Drivers' && app.kategori !== activeCategory) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = app.nama.toLowerCase().includes(q);
        const matchDesc = app.deskripsi.toLowerCase().includes(q);
        const matchCat = app.kategori.toLowerCase().includes(q);
        if (!matchName && !matchDesc && !matchCat) return false;
      }

      // Filter pill (all / not installed / selected)
      const isInstalled = Boolean(installedMap[app.id]?.installed);
      const isSelected = selectedAppIds.includes(app.id);

      if (filterType === 'not-installed' && isInstalled) return false;
      if (filterType === 'selected' && !isSelected) return false;

      return true;
    });
  }, [apps, activeCategory, searchQuery, filterType, installedMap, selectedAppIds]);

  // Estimated install size calculation (~150MB per app avg)
  const estimatedSizeGB = useMemo(() => {
    const totalMB = selectedAppIds.length * 150;
    return (totalMB / 1024).toFixed(1);
  }, [selectedAppIds]);

  const isDiskInsufficient = useMemo(() => {
    if (!systemStatus || systemStatus.diskFreeGB <= 0) return false;
    const estGB = parseFloat(estimatedSizeGB);
    return systemStatus.diskFreeGB < estGB;
  }, [systemStatus, estimatedSizeGB]);

  // Selection handlers
  const handleToggleSelect = (appId: string) => {
    setSelectedAppIds((prev) =>
      prev.includes(appId) ? prev.filter((id) => id !== appId) : [...prev, appId]
    );
  };

  const handleSelectAllVisible = () => {
    const visibleIds = filteredApps.map((a) => a.id);
    setSelectedAppIds((prev) => Array.from(new Set([...prev, ...visibleIds])));
  };

  const handleDeselectAllVisible = () => {
    const visibleIds = new Set(filteredApps.map((a) => a.id));
    setSelectedAppIds((prev) => prev.filter((id) => !visibleIds.has(id)));
  };

  // Queue actions
  const handleStartInstall = async (targetIds: string[] = selectedAppIds) => {
    if (targetIds.length === 0 || !window.api) return;

    // Check winget availability if installing any winget app
    const hasWingetApp = targetIds.some((id) => {
      const a = apps.find((item) => item.id === id);
      return a && a.source === 'winget';
    });

    if (hasWingetApp && systemStatus && !systemStatus.hasWinget) {
      setShowWingetGuideModal(true);
      return;
    }

    // Build simplified installed map for skipping
    const installedBoolMap: Record<string, boolean> = {};
    for (const [id, info] of Object.entries(installedMap)) {
      if (info.installed) installedBoolMap[id] = true;
    }

    setIsQueueRunning(true);
    setQueueSummary(null);
    setShowQueueModal(true);

    await window.api.startInstallQueue(targetIds, installedBoolMap);
  };

  const handleCancelApp = (appId: string) => {
    window.api?.cancelApp(appId);
  };

  const handleCancelAll = () => {
    window.api?.cancelAll();
    setIsQueueRunning(false);
  };

  const handleRetryFailed = (failedIds: string[]) => {
    handleStartInstall(failedIds);
  };

  // Preset actions
  const handleApplyPreset = (appIds: string[]) => {
    setSelectedAppIds(appIds);
  };

  const handleSaveCustomPreset = async (preset: PresetProfile) => {
    const updated = await window.api?.saveCustomPreset(preset);
    if (updated) setPresets(updated);
  };

  const handleDeleteCustomPreset = async (presetId: string) => {
    const updated = await window.api?.deleteCustomPreset(presetId);
    if (updated) setPresets(updated);
  };

  const handleExportPresets = async () => {
    const res = await window.api?.exportPresets(presets);
    if (res?.success) {
      alert(`Preset berhasil diekspor ke: ${res.path}`);
    }
  };

  const handleImportPresets = async () => {
    const updated = await window.api?.importPresets();
    if (updated) {
      setPresets(updated);
      alert('Preset berhasil diimpor!');
    }
  };

  const handleSaveConfig = async (partial: Partial<AppConfig>) => {
    const updated = await window.api?.saveConfig(partial);
    if (updated) setConfig(updated);
  };

  return (
    <div className="app-container">
      {/* Diagnostics & Navigation Header */}
      <Header
        systemStatus={systemStatus}
        onOpenPresets={() => setShowPresetsModal(true)}
        onOpenLogs={() => setShowLogsModal(true)}
        onOpenSettings={() => setShowSettingsModal(true)}
      />

      <div className="main-layout">
        {/* Left Sidebar */}
        <Sidebar
          activeCategory={activeCategory}
          onSelectCategory={(cat) => setActiveCategory(cat)}
          categoryCounts={categoryCounts}
        />

        {/* Center Main Content */}
        <main className="content-area">
          {activeCategory === 'Tweaks' ? (
            <div className="scroll-content">
              <TweaksTab />
            </div>
          ) : activeCategory === 'Drivers' ? (
            <div className="scroll-content">
              <DriverCenterTab />
            </div>
          ) : (
            <>
              {/* Search & Action Bar */}
              <div className="action-bar">
                <div className="search-box">
                  <Search size={14} color="var(--muted)" />
                  <input
                    type="text"
                    className="search-input"
                    placeholder={i18n.searchPlaceholder}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <div className="filter-pills">
                  <button
                    className={`filter-btn ${filterType === 'all' ? 'active' : ''}`}
                    onClick={() => setFilterType('all')}
                  >
                    {i18n.filterAll}
                  </button>
                  <button
                    className={`filter-btn ${filterType === 'not-installed' ? 'active' : ''}`}
                    onClick={() => setFilterType('not-installed')}
                  >
                    {i18n.filterNotInstalled}
                  </button>
                  <button
                    className={`filter-btn ${filterType === 'selected' ? 'active' : ''}`}
                    onClick={() => setFilterType('selected')}
                  >
                    {i18n.filterSelected} ({selectedAppIds.length})
                  </button>
                </div>

                <div className="batch-actions">
                  <button
                    className="btn-secondary"
                    onClick={handleSelectAllVisible}
                    title="Pilih semua aplikasi yang tampil"
                  >
                    <CheckSquare size={13} /> {i18n.selectAll}
                  </button>
                  <button
                    className="btn-secondary"
                    onClick={handleDeselectAllVisible}
                    title="Batal pilih aplikasi yang tampil"
                  >
                    <Square size={13} /> {i18n.deselectAll}
                  </button>
                </div>

                {/* Grid <-> List Toggle */}
                <div className="view-toggle">
                  <button
                    className={`view-toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
                    onClick={() => handleToggleViewMode('list')}
                    title="Mode List (Default)"
                  >
                    <List size={14} />
                  </button>
                  <button
                    className={`view-toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
                    onClick={() => handleToggleViewMode('grid')}
                    title="Mode Grid"
                  >
                    <LayoutGrid size={14} />
                  </button>
                </div>
              </div>

              {/* View Container (List or Grid) */}
              <div className="scroll-content">
                {filteredApps.length === 0 ? (
                  <div
                    style={{
                      textAlign: 'center',
                      padding: '60px 20px',
                      color: 'var(--muted)'
                    }}
                  >
                    <p style={{ fontSize: '14px', marginBottom: '8px' }}>
                      Tidak ada aplikasi yang cocok dengan pencarian atau filter ini.
                    </p>
                    <button
                      className="btn-secondary"
                      onClick={() => {
                        setSearchQuery('');
                        setFilterType('all');
                      }}
                    >
                      Reset Filter
                    </button>
                  </div>
                ) : viewMode === 'list' ? (
                  <div className="app-list">
                    <div className="list-header">
                      <span></span>
                      <span></span>
                      <span>aplikasi</span>
                      <span>versi</span>
                      <span>status</span>
                      <span style={{ textAlign: 'right' }}>ukuran</span>
                    </div>

                    {filteredApps.map((app) => (
                      <AppListRow
                        key={app.id}
                        app={app}
                        isSelected={selectedAppIds.includes(app.id)}
                        onToggle={handleToggleSelect}
                        installedInfo={installedMap[app.id]}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="app-grid">
                    {filteredApps.map((app) => (
                      <AppCard
                        key={app.id}
                        app={app}
                        isSelected={selectedAppIds.includes(app.id)}
                        onToggle={handleToggleSelect}
                        installedInfo={installedMap[app.id]}
                      />
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </main>
      </div>

      {/* Bottom Sticky Action & Queue Bar (Hidden on Tweaks & Drivers tab) */}
      {activeCategory !== 'Tweaks' && activeCategory !== 'Drivers' && (
        <footer className="bottom-bar">
          <div className="selection-summary">
            <div className={`selection-summary-text ${isDiskInsufficient ? 'error-disk' : ''}`}>
              <span className="mono-num">{selectedAppIds.length}</span> aplikasi dipilih
              <span>•</span>
              perkiraan <span className="mono-num">{estimatedSizeGB} GB</span>
              <span>•</span>
              sisa disk <span className="mono-num">{systemStatus?.diskFreeGB || 0} GB</span>
              {isDiskInsufficient && <span style={{ color: 'var(--danger)', fontWeight: 600 }}> (Disk Tidak Cukup!)</span>}
            </div>

            {selectedAppIds.length > 0 && (
              <button
                className="btn-secondary"
                style={{ padding: '2px 8px', fontSize: '11px', marginLeft: '12px' }}
                onClick={() => setSelectedAppIds([])}
              >
                Kosongkan
              </button>
            )}
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            {isQueueRunning && (
              <button
                className="btn-secondary"
                onClick={() => setShowQueueModal(true)}
                style={{ borderColor: 'var(--blue)', color: 'var(--blue)' }}
              >
                Lihat Antrean
              </button>
            )}

            <button
              className="btn-primary"
              disabled={selectedAppIds.length === 0 || isQueueRunning || isDiskInsufficient}
              onClick={() => handleStartInstall()}
            >
              {isQueueRunning ? <Loader2 size={15} className="animate-spin" /> : <Play size={15} />}
              {isQueueRunning ? i18n.installing : `Pasang ${selectedAppIds.length} aplikasi`}
            </button>
          </div>
        </footer>
      )}

      {/* Modals */}
      <QueueModal
        isOpen={showQueueModal}
        onClose={() => setShowQueueModal(false)}
        apps={apps}
        progressMap={progressMap}
        summary={queueSummary}
        isRunning={isQueueRunning}
        onCancelApp={handleCancelApp}
        onCancelAll={handleCancelAll}
        onRetryFailed={handleRetryFailed}
      />

      <PresetsModal
        isOpen={showPresetsModal}
        onClose={() => setShowPresetsModal(false)}
        presets={presets}
        selectedAppIds={selectedAppIds}
        onApplyPreset={handleApplyPreset}
        onSaveCustomPreset={handleSaveCustomPreset}
        onDeleteCustomPreset={handleDeleteCustomPreset}
        onExportPresets={handleExportPresets}
        onImportPresets={handleImportPresets}
      />

      <LogsModal
        isOpen={showLogsModal}
        onClose={() => setShowLogsModal(false)}
        logs={logs}
        onClearLogs={() => setLogs([])}
      />

      <SettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        config={config}
        onSaveConfig={handleSaveConfig}
      />

      <WingetGuideModal
        isOpen={showWingetGuideModal}
        onClose={() => setShowWingetGuideModal(false)}
      />
    </div>
  );
};
