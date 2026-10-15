import React from 'react';
import {
  Layers,
  Globe,
  Code2,
  Terminal,
  Database,
  FileText,
  Wrench,
  MessageCircle,
  PlaySquare,
  Gamepad2,
  Cpu,
  Sparkles,
  SlidersHorizontal,
  HardDrive
} from 'lucide-react';
import { AppCategory } from '../../electron/types';

export type CategoryFilter = 'all' | AppCategory | 'Drivers' | 'Tweaks';

interface SidebarProps {
  activeCategory: CategoryFilter;
  onSelectCategory: (cat: CategoryFilter) => void;
  categoryCounts: Record<string, number>;
  problemDriverCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeCategory,
  onSelectCategory,
  categoryCounts,
  problemDriverCount = 0
}) => {
  const categories: { id: CategoryFilter; name: string; icon: React.ReactNode; isPurple?: boolean }[] = [
    { id: 'all', name: 'semua software', icon: <Layers size={15} /> },
    { id: 'Browser', name: 'browser', icon: <Globe size={15} /> },
    { id: 'IDE & Editor', name: 'ide & editor', icon: <Code2 size={15} /> },
    { id: 'Dev Tools', name: 'dev tools', icon: <Terminal size={15} /> },
    { id: 'Server & DB', name: 'server & db', icon: <Database size={15} /> },
    { id: 'Office & Desain', name: 'office & desain', icon: <FileText size={15} /> },
    { id: 'Utilities', name: 'utilities', icon: <Wrench size={15} /> },
    { id: 'Sosmed', name: 'sosmed & chat', icon: <MessageCircle size={15} /> },
    { id: 'Media', name: 'media & audio', icon: <PlaySquare size={15} /> },
    { id: 'Gaming', name: 'gaming', icon: <Gamepad2 size={15} /> },
    { id: 'Drivers & Runtimes', name: 'runtimes & c++', icon: <Cpu size={15} /> },
    {
      id: 'Creative (ArtCraft)',
      name: 'creative (artcraft)',
      icon: <Sparkles size={15} />,
      isPurple: true
    },
    {
      id: 'Drivers',
      name: 'driver center',
      icon: <HardDrive size={15} />,
      isPurple: true
    },
    {
      id: 'Tweaks',
      name: 'tweaks & cleaner',
      icon: <SlidersHorizontal size={15} />
    }
  ];

  return (
    <aside className="sidebar">
      <div className="nav-section-title">kategori software</div>

      {categories.map((cat) => {
        const isActive = activeCategory === cat.id;

        return (
          <button
            key={cat.id}
            className={`nav-item ${cat.isPurple ? 'purple-tab' : ''} ${isActive ? 'active' : ''}`}
            onClick={() => onSelectCategory(cat.id)}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {cat.icon}
              <span>{cat.name}</span>
            </div>
            {cat.id === 'Drivers' ? (
              problemDriverCount > 0 ? (
                <span className="nav-count" style={{ color: 'var(--purple)', fontWeight: 600 }}>
                  {problemDriverCount}
                </span>
              ) : null
            ) : cat.id !== 'Tweaks' ? (
              <span className="nav-count">
                {cat.id === 'all' ? categoryCounts.total || 0 : categoryCounts[cat.id] || 0}
              </span>
            ) : null}
          </button>
        );
      })}
    </aside>
  );
};
