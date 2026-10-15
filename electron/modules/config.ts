import fs from 'fs';
import path from 'path';
import os from 'os';
import { AppConfig, PresetProfile } from '../types';

export class ConfigManager {
  private baseDir: string;
  private configFile: string;
  private customPresetsFile: string;

  private defaultConfig: AppConfig = {
    maxParallel: 2,
    skipAlreadyInstalled: true,
    theme: 'hacker-dark',
    autoRetryCount: 3
  };

  constructor() {
    const appData = process.env.APPDATA || path.join(os.homedir(), 'AppData', 'Roaming');
    this.baseDir = path.join(appData, 'Kickstart');
    this.configFile = path.join(this.baseDir, 'config.json');
    this.customPresetsFile = path.join(this.baseDir, 'custom_presets.json');

    try {
      const oldDir = path.join(appData, 'SetupInul');
      if (fs.existsSync(oldDir) && !fs.existsSync(this.baseDir)) {
        // One-time migration: copy contents (config, preset, logs) to Kickstart
        fs.cpSync(oldDir, this.baseDir, { recursive: true });
      }

      if (!fs.existsSync(this.baseDir)) {
        fs.mkdirSync(this.baseDir, { recursive: true });
      }
    } catch (err) {
      console.error('Failed to initialize or migrate config dir:', err);
    }
  }

  public getConfig(): AppConfig {
    try {
      if (fs.existsSync(this.configFile)) {
        const raw = fs.readFileSync(this.configFile, 'utf8');
        return { ...this.defaultConfig, ...JSON.parse(raw) };
      }
    } catch (err) {
      console.error('Error reading config, using defaults:', err);
    }
    return this.defaultConfig;
  }

  public saveConfig(config: Partial<AppConfig>): AppConfig {
    const current = this.getConfig();
    const updated = { ...current, ...config };
    try {
      fs.writeFileSync(this.configFile, JSON.stringify(updated, null, 2), 'utf8');
    } catch (err) {
      console.error('Error saving config:', err);
    }
    return updated;
  }

  public getCustomPresets(): PresetProfile[] {
    try {
      if (fs.existsSync(this.customPresetsFile)) {
        const raw = fs.readFileSync(this.customPresetsFile, 'utf8');
        return JSON.parse(raw);
      }
    } catch (err) {
      console.error('Error reading custom presets:', err);
    }
    return [];
  }

  public saveCustomPreset(preset: PresetProfile): PresetProfile[] {
    const list = this.getCustomPresets();
    const existingIndex = list.findIndex(p => p.id === preset.id);
    preset.isCustom = true;

    if (existingIndex >= 0) {
      list[existingIndex] = preset;
    } else {
      list.push(preset);
    }

    try {
      fs.writeFileSync(this.customPresetsFile, JSON.stringify(list, null, 2), 'utf8');
    } catch (err) {
      console.error('Error saving custom presets:', err);
    }
    return list;
  }

  public deleteCustomPreset(presetId: string): PresetProfile[] {
    const list = this.getCustomPresets().filter(p => p.id !== presetId);
    try {
      fs.writeFileSync(this.customPresetsFile, JSON.stringify(list, null, 2), 'utf8');
    } catch (err) {
      console.error('Error deleting custom preset:', err);
    }
    return list;
  }

  public exportPresetsToFile(filePath: string, presets: PresetProfile[]): boolean {
    try {
      fs.writeFileSync(filePath, JSON.stringify(presets, null, 2), 'utf8');
      return true;
    } catch (err) {
      console.error('Error exporting presets:', err);
      return false;
    }
  }

  public importPresetsFromFile(filePath: string): PresetProfile[] {
    try {
      const raw = fs.readFileSync(filePath, 'utf8');
      const imported: PresetProfile[] = JSON.parse(raw);
      const current = this.getCustomPresets();

      for (const p of imported) {
        p.isCustom = true;
        const idx = current.findIndex(c => c.id === p.id);
        if (idx >= 0) {
          current[idx] = p;
        } else {
          current.push(p);
        }
      }

      fs.writeFileSync(this.customPresetsFile, JSON.stringify(current, null, 2), 'utf8');
      return current;
    } catch (err) {
      console.error('Error importing presets:', err);
      return this.getCustomPresets();
    }
  }
}

export const configManager = new ConfigManager();
