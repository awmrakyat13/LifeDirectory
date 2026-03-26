import { memo } from 'react';
import type { OrbitRing as OrbitRingType } from '../../utils/orbitCalculator';

interface OrbitRingProps {
  ring: OrbitRingType;
}

export const OrbitRing = memo(function OrbitRing({ ring }: OrbitRingProps) {
  return (
    <g filter="url(#ringGlow)">
      {/* Faint full orbit path */}
      <circle
        cx={0} cy={0} r={ring.radius}
        fill="none"
        stroke={ring.color}
        strokeOpacity={0.08}
        strokeWidth={1}
      />
      {/* Animated glowing accent dash */}
      <circle
        cx={0} cy={0} r={ring.radius}
        fill="none"
        stroke={ring.color}
        strokeOpacity={0.25}
        strokeWidth={1.5}
        strokeDasharray={`${ring.radius * 0.3} ${ring.radius * 6}`}
      >
        <animateTransform
          attributeName="transform"
          type="rotate"
          from="0 0 0"
          to="360 0 0"
          dur={`${80 + ring.ring * 20}s`}
          repeatCount="indefinite"
        />
      </circle>
      {/* Ring label */}
      <text
        x={0} y={-ring.radius - 10}
        textAnchor="middle"
        fill={ring.color}
        fillOpacity={0.3}
        fontSize={11}
        fontWeight={400}
      >
        {ring.label}
      </text>
    </g>
  );
});
