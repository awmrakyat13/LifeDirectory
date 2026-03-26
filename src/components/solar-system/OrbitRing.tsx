import { memo } from 'react';
import type { OrbitRing as OrbitRingType } from '../../utils/orbitCalculator';

interface OrbitRingProps {
  ring: OrbitRingType;
}

export const OrbitRing = memo(function OrbitRing({ ring }: OrbitRingProps) {
  return (
    <g>
      <circle
        cx={0}
        cy={0}
        r={ring.radius}
        fill="none"
        stroke={ring.color}
        strokeOpacity={0.12}
        strokeWidth={1}
        strokeDasharray="6 10"
      />
      <text
        x={0}
        y={-ring.radius - 10}
        textAnchor="middle"
        fill={ring.color}
        fillOpacity={0.4}
        fontSize={12}
        fontWeight={500}
      >
        {ring.label}
      </text>
    </g>
  );
});
