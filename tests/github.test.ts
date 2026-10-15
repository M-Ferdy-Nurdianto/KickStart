import { describe, it, expect } from 'vitest';
import { selectGitHubAsset, GitHubAsset } from '../electron/modules/github';

describe('GitHub Asset Selector (selectGitHubAsset)', () => {
  const samplePhotoCraftAssets: GitHubAsset[] = [
    { name: 'photocraft-0.9.0-freebsd-x86_64.tar.gz', browser_download_url: 'http://test/1', size: 100 },
    { name: 'photocraft-0.9.0-linux-x86_64.AppImage', browser_download_url: 'http://test/2', size: 100 },
    { name: 'photocraft-0.9.0-macos-universal.dmg', browser_download_url: 'http://test/3', size: 100 },
    { name: 'photocraft-0.9.0-windows-arm64.msi', browser_download_url: 'http://test/arm64msi', size: 100 },
    { name: 'photocraft-0.9.0-windows-x64-portable.zip', browser_download_url: 'http://test/5', size: 100 },
    { name: 'photocraft-0.9.0-windows-x64.msi', browser_download_url: 'http://test/x64msi', size: 100 },
    { name: 'SHA256SUMS.txt', browser_download_url: 'http://test/sums', size: 10 }
  ];

  const sampleArtCraftAssets: GitHubAsset[] = [
    { name: 'ArtCraft_0.41.0_universal.dmg', browser_download_url: 'http://test/dmg', size: 100 },
    { name: 'ArtCraft_0.41.0_x64-setup.exe', browser_download_url: 'http://test/x64exe', size: 100 },
    { name: 'ArtCraft_0.41.0_x64_en-US.msi', browser_download_url: 'http://test/x64msi', size: 100 }
  ];

  it('selects windows x64 msi when running on x64 architecture', () => {
    const selected = selectGitHubAsset(samplePhotoCraftAssets, 'x64');
    expect(selected).not.toBeNull();
    expect(selected?.asset.name).toBe('photocraft-0.9.0-windows-x64.msi');
    expect(selected?.installType).toBe('msi');
  });

  it('selects windows arm64 msi when running on arm64 architecture', () => {
    const selected = selectGitHubAsset(samplePhotoCraftAssets, 'arm64');
    expect(selected).not.toBeNull();
    expect(selected?.asset.name).toBe('photocraft-0.9.0-windows-arm64.msi');
    expect(selected?.installType).toBe('msi');
  });

  it('prioritizes MSI over EXE for ArtCraft on x64', () => {
    const selected = selectGitHubAsset(sampleArtCraftAssets, 'x64');
    expect(selected).not.toBeNull();
    expect(selected?.asset.name).toBe('ArtCraft_0.41.0_x64_en-US.msi');
    expect(selected?.installType).toBe('msi');
  });

  it('falls back to EXE if only EXE is present', () => {
    const exeOnlyAssets: GitHubAsset[] = [
      { name: 'tool-mac.dmg', browser_download_url: 'http://test/1', size: 100 },
      { name: 'tool-setup-x64.exe', browser_download_url: 'http://test/exe', size: 100 }
    ];
    const selected = selectGitHubAsset(exeOnlyAssets, 'x64');
    expect(selected).not.toBeNull();
    expect(selected?.asset.name).toBe('tool-setup-x64.exe');
    expect(selected?.installType).toBe('exe');
  });

  it('respects custom regex pattern when provided', () => {
    const selected = selectGitHubAsset(sampleArtCraftAssets, 'x64', '.*-setup\\.exe');
    expect(selected).not.toBeNull();
    expect(selected?.asset.name).toBe('ArtCraft_0.41.0_x64-setup.exe');
    expect(selected?.installType).toBe('exe');
  });

  it('returns null if no Windows installers exist in release', () => {
    const macLinuxAssets: GitHubAsset[] = [
      { name: 'app-linux.tar.gz', browser_download_url: 'http://test/1', size: 100 },
      { name: 'app-macos.dmg', browser_download_url: 'http://test/2', size: 100 }
    ];
    const selected = selectGitHubAsset(macLinuxAssets, 'x64');
    expect(selected).toBeNull();
  });
});
