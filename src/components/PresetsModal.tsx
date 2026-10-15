import React, { useState } from 'react';
import { X, Check, Download, Upload, Trash2, Plus, Sparkles, Sliders } from 'lucide-react';
import { PresetProfile } from '../../electron/types';
import { i18n } from '../i18n';

interface PresetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  presets: PresetProfile[];
  selectedAppIds: string[];
  onApplyPreset: (appIds: string[]) => void;
  onSaveCustomPreset: (preset: PresetProfile) => void;
  onDeleteCustomPreset: (presetId: string) => void;
  onExportPresets: () => void;
  onImportPresets: () => void;
}

export const PresetsModal: React.FC<PresetsModalProps> = ({
  isOpen,
  onClose,
  presets,
  selectedAppIds,
  onApplyPreset,
  onSaveCustomPreset,
  onDeleteCustomPreset,
  onExportPresets,
  onImportPresets
}) => {
  const [showSaveForm, setShowSaveForm] = useState(false);
  const [newPresetName, setNewPresetName] = useState('');
  const [newPresetDesc, setNewPresetDesc] = useState('');

  if (!isOpen) return null;

  const handleSaveCurrent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPresetName.trim() || selectedAppIds.length === 0) return;

    const newPreset: PresetProfile = {
      id: `custom-${Date.now()}`,
      nama: newPresetName.trim(),
      deskripsi: newPresetDesc.trim() || `Racikan custom berisi ${selectedAppIds.length} aplikasi pilihan`,
      appIds: [...selectedAppIds],
      isCustom: true
    };

    onSaveCustomPreset(newPreset);
    setNewPresetName('');
    setNewPresetDesc('');
    setShowSaveForm(false);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '640px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sliders size={18} color="var(--cyan)" />
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff' }}>
              {i18n.presetsTitle}
            </h2>
          </div>
          <button className="btn-secondary" onClick={onClose} style={{ padding: '4px 8px' }}>
            <X size={16} />
          </button>
        </div>

        <div className="modal-body">
          <p style={{ color: 'var(--text-dim)', fontSize: '0.82rem', marginBottom: '16px' }}>
            {i18n.presetsSubtitle}
          </p>

          {/* Action bar for Import/Export/Save */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
            <button
              className="btn-primary"
              style={{ padding: '6px 12px', fontSize: '0.8rem' }}
              onClick={() => setShowSaveForm(!showSaveForm)}
              disabled={selectedAppIds.length === 0}
              title={selectedAppIds.length === 0 ? 'Pilih minimal 1 aplikasi untuk disimpan' : ''}
            >
              <Plus size={14} /> {i18n.savePresetBtn} ({selectedAppIds.length})
            </button>

            <button className="btn-secondary" onClick={onExportPresets}>
              <Download size={14} /> {i18n.exportPresetBtn}
            </button>

            <button className="btn-secondary" onClick={onImportPresets}>
              <Upload size={14} /> {i18n.importPresetBtn}
            </button>
          </div>

          {/* Save Custom Form */}
          {showSaveForm && (
            <form
              onSubmit={handleSaveCurrent}
              style={{
                background: 'rgba(0, 212, 255, 0.05)',
                border: '1px solid rgba(0, 212, 255, 0.25)',
                padding: '14px',
                borderRadius: '8px',
                marginBottom: '16px'
              }}
            >
              <h4 style={{ color: 'var(--cyan)', fontSize: '0.88rem', marginBottom: '10px' }}>
                Simpan {selectedAppIds.length} Aplikasi Terpilih
              </h4>
              <div className="form-group">
                <label className="form-label">Nama Preset</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Contoh: Paket Desain & Animasi"
                  value={newPresetName}
                  onChange={(e) => setNewPresetName(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Deskripsi Singkat</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Catatan aplikasi atau tujuan setup"
                  value={newPresetDesc}
                  onChange={(e) => setNewPresetDesc(e.target.value)}
                />
              </div>
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowSaveForm(false)}
                >
                  Batal
                </button>
                <button type="submit" className="btn-primary" style={{ padding: '6px 14px' }}>
                  Simpan Preset
                </button>
              </div>
            </form>
          )}

          {/* Presets List */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '10px' }}>
            {presets.map((preset) => {
              const isFullySelected =
                preset.appIds.length > 0 &&
                preset.appIds.every((id) => selectedAppIds.includes(id));

              return (
                <div
                  key={preset.id}
                  className="preset-card"
                  onClick={() => {
                    onApplyPreset(preset.appIds);
                    onClose();
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Sparkles size={16} color="var(--green)" />
                      <strong style={{ color: '#fff', fontSize: '0.92rem' }}>{preset.nama}</strong>
                      {preset.isCustom && (
                        <span className="badge-tag badge-artcraft" style={{ fontSize: '0.68rem' }}>
                          Custom
                        </span>
                      )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className="badge-tag badge-installed">
                        {preset.appIds.length} Aplikasi
                      </span>

                      {preset.isCustom && (
                        <button
                          className="btn-secondary"
                          style={{ padding: '3px 6px', color: 'var(--danger)', borderColor: 'rgba(255, 71, 87, 0.3)' }}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm(i18n.deletePresetConfirm)) {
                              onDeleteCustomPreset(preset.id);
                            }
                          }}
                          title="Hapus Preset Custom"
                        >
                          <Trash2 size={12} />
                        </button>
                      )}

                      {isFullySelected && (
                        <span title="Preset ini sedang aktif dipilih">
                          <Check size={16} color="var(--green)" strokeWidth={3} />
                        </span>
                      )}
                    </div>
                  </div>

                  <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', margin: 0 }}>
                    {preset.deskripsi}
                  </p>
                </div>
              );
            })}
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
