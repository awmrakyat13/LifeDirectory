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
  const color = type === 'linked' ? '#5DADE2' : '#9B59B6';
  const opacity = isHighlighted ? SOLAR.LINE_HOVER_OPACITY : SOLAR.LINE_OPACITY;

  return (
    <g>
      {/* Glow layer */}
      <line
        x1={from.x} y1={from.y} x2={to.x} y2={to.y}
        stroke={color}
        strokeOpacity={opacity * 0.5}
        strokeWidth={type === 'linked' ? 4 : 3}
        strokeDasharray={type === 'company' ? '4 4' : undefined}
        filter="url(#lineGlow)"
      />
      {/* Sharp line */}
      <line
        x1={from.x} y1={from.y} x2={to.x} y2={to.y}
        stroke={color}
        strokeOpacity={opacity}
        strokeWidth={type === 'linked' ? 1.5 : 1}
        strokeDasharray={type === 'company' ? '4 4' : undefined}
      />
    </g>
  );
});
