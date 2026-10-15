import React from 'react';
import * as siIcons from 'simple-icons';
import * as LucideIcons from 'lucide-react';

interface BrandIconProps {
  appName: string;
  category?: string;
  size?: number;
  className?: string;
}

// Normalized mapping to simple-icons keys
const BRAND_MAP: Record<string, string> = {
  // Browsers
  'google chrome': 'siGooglechrome',
  'chrome': 'siGooglechrome',
  'brave browser': 'siBrave',
  'brave': 'siBrave',
  'mozilla firefox': 'siFirefoxbrowser',
  'firefox': 'siFirefoxbrowser',
  'opera': 'siOpera',
  'opera gx': 'siOperagx',
  'microsoft edge': 'siMicrosoftedge',
  'edge': 'siMicrosoftedge',
  'vivaldi': 'siVivaldi',
  'tor browser': 'siTorbrowser',
  'arc': 'siArc',

  // Dev & Editors
  'visual studio code': 'siVscodium', // closest brand icon or fallback
  'vscode': 'siVscodium',
  'vscodium': 'siVscodium',
  'cursor ai editor': 'siOpenai',
  'cursor': 'siOpenai',
  'intellij idea community': 'siIntellijidea',
  'intellij': 'siIntellijidea',
  'pycharm community': 'siPycharm',
  'pycharm': 'siPycharm',
  'sublime text': 'siSublimetext',
  'notepad++': 'siNotepadplusplus',
  'neovim': 'siNeovim',
  'git': 'siGit',
  'github desktop': 'siGithub',
  'gitkraken': 'siGitkraken',
  'postman': 'siPostman',
  'insomnia': 'siInsomnia',
  'docker desktop': 'siDocker',
  'docker': 'siDocker',
  'node.js (lts)': 'siNodedotjs',
  'nodejs': 'siNodedotjs',
  'node': 'siNodedotjs',
  'python': 'siPython',
  'golang (go)': 'siGo',
  'go': 'siGo',
  'rust (rustup)': 'siRust',
  'rust': 'siRust',
  'openjdk (java)': 'siOpenjdk',
  'java': 'siOpenjdk',

  // Server & DB
  'dbeaver community': 'siDbeaver',
  'dbeaver': 'siDbeaver',
  'tableplus': 'siTableplus',
  'mongodb compass': 'siMongodb',
  'mongodb': 'siMongodb',
  'redis insight': 'siRedis',
  'redis': 'siRedis',
  'pgadmin 4': 'siPostgresql',
  'postgresql': 'siPostgresql',

  // Office & Design
  'libreoffice': 'siLibreoffice',
  'obsidian': 'siObsidian',
  'notion': 'siNotion',
  'figma': 'siFigma',
  'blender': 'siBlender',
  'gimp': 'siGimp',
  'inkscape': 'siInkscape',

  // Utilities
  '7-zip': 'si7zip',
  'peazip': 'siPeazip',
  'powertoys': 'siWindows',
  'everything': 'siSearch',
  'rufus': 'siRufus',
  'qbittorrent': 'siQbittorrent',

  // Sosmed & Chat
  'discord': 'siDiscord',
  'telegram desktop': 'siTelegram',
  'telegram': 'siTelegram',
  'whatsapp': 'siWhatsapp',
  'slack': 'siSlack',
  'zoom': 'siZoom',

  // Media
  'spotify': 'siSpotify',
  'vlc media player': 'siVlcmediaplayer',
  'vlc': 'siVlcmediaplayer',
  'obs studio': 'siObsstudio',
  'audacity': 'siAudacity',
  'handbrake': 'siHandbrake',

  // Gaming
  'steam': 'siSteam',
  'epic games launcher': 'siEpicgames',
  'epic games': 'siEpicgames',
  'gog galaxy': 'siGogdotcom',
  'ea app': 'siEa',

  // Drivers & Tools
  'snappy driver installer origin': 'siWindows',
  'dell command | update': 'siDell',
  'lenovo system update': 'siLenovo',
  'hp support assistant': 'siHp',
  'nvidia app': 'siNvidia',
  'nvidia': 'siNvidia',
  'intel': 'siIntel',
  'intel® driver & support assistant': 'siIntel',
  'amd': 'siAmd',
  'msi center': 'siMsi'
};

export const BrandIcon: React.FC<BrandIconProps> = ({
  appName,
  category,
  size = 20,
  className
}) => {
  const norm = appName.toLowerCase().trim();
  const matchedKey = BRAND_MAP[norm] || Object.keys(BRAND_MAP).find((k) => norm.includes(k));
  const iconData = matchedKey ? (siIcons as any)[BRAND_MAP[matchedKey]] : null;

  if (iconData && iconData.svg) {
    const brandColor = `#${iconData.hex}`;
    return (
      <svg
        role="img"
        viewBox="0 0 24 24"
        width={size}
        height={size}
        fill={brandColor}
        className={className}
        style={{ display: 'inline-block', flexShrink: 0 }}
        dangerouslySetInnerHTML={{ __html: iconData.svg.replace(/^<svg[^>]*>|<\/svg>$/g, '') }}
      />
    );
  }

  // Fallback monogram: first letter with neutral color and clean shape
  const monogram = (appName.trim()[0] || '?').toUpperCase();

  return (
    <div
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: '4px',
        backgroundColor: 'var(--surface-2)',
        border: '1px solid var(--border)',
        color: 'var(--muted)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: `${Math.max(10, Math.round(size * 0.55))}px`,
        fontWeight: 700,
        fontFamily: 'var(--font-mono)',
        flexShrink: 0
      }}
      className={className}
    >
      {monogram}
    </div>
  );
};
