import { memo } from 'react';
import { SOLAR } from '../../constants/solarSystem';

interface ConnectionLineProps {
  from: { x: number; y: number };
  to: { x: number; y: number };
  type: 'linked' | 'company';
  isHighlighted: boolean;
}

export const ConnectionLine = memo(function ConnectionLine({
  from,
  to,
  type,
  isHighlighted,
}: ConnectionLineProps) {
  return (
    <line
      x1={from.x}
      y1={from.y}
      x2={to.x}
      y2={to.y}
      stroke={type === 'linked' ? 'var(--color-accent)' : 'var(--color-text-tertiary)'}
      strokeOpacity={isHighlighted ? SOLAR.LINE_HOVER_OPACITY : SOLAR.LINE_OPACITY}
      strokeWidth={type === 'linked' ? 1.5 : 1}
      strokeDasharray={type === 'company' ? '4 4' : undefined}
    />
  );
});
