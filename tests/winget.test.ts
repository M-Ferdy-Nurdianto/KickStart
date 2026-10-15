import { describe, it, expect } from 'vitest';
import { parseWingetOutput } from '../electron/modules/winget';

describe('Winget Output Parser (parseWingetOutput)', () => {
  it('detects downloading status and percentage', () => {
    const chunk = '  ████████████████░░░░░░░░░░░░  53%   12.4 MB / 23.5 MB';
    const result = parseWingetOutput(chunk);
    expect(result.percentage).toBe(53);
    expect(result.status).toBe('downloading');
  });

  it('detects Indonesian download text', () => {
    const chunk = 'Mengunduh https://download.example.com/setup.exe... 78%';
    const result = parseWingetOutput(chunk);
    expect(result.percentage).toBe(78);
    expect(result.status).toBe('downloading');
  });

  it('detects hash verification status', () => {
    const chunk = 'Successfully verified installer hash';
    const result = parseWingetOutput(chunk);
    expect(result.status).toBe('verifying');
  });

  it('detects installing status in English and Indonesian', () => {
    const chunkEn = 'Starting package install...';
    expect(parseWingetOutput(chunkEn).status).toBe('installing');

    const chunkId = 'Sedang menginstal paket perangkat lunak...';
    expect(parseWingetOutput(chunkId).status).toBe('installing');
  });

  it('detects completed status and sets percentage to 100', () => {
    const chunk = 'Successfully installed!';
    const result = parseWingetOutput(chunk);
    expect(result.status).toBe('completed');
    expect(result.percentage).toBe(100);
  });

  it('detects already installed status', () => {
    const chunk = 'Aplikasi ini sudah diinstal pada sistem (0x8a150049).';
    const result = parseWingetOutput(chunk);
    expect(result.status).toBe('already_installed');
    expect(result.percentage).toBe(100);
  });

  it('detects failed error output', () => {
    const chunk = 'Error: Failed to install package. Exit code: 1603';
    const result = parseWingetOutput(chunk);
    expect(result.status).toBe('failed');
    expect(result.message).toContain('Failed to install');
  });
});
