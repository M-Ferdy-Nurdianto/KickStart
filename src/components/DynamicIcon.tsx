import React from 'react';
import * as Icons from 'lucide-react';

interface DynamicIconProps {
  name: string;
  size?: number;
  className?: string;
}

export const DynamicIcon: React.FC<DynamicIconProps> = ({ name, size = 20, className }) => {
  // @ts-ignore
  const IconComponent = Icons[name] || Icons.Box;
  return <IconComponent size={size} className={className} />;
};
