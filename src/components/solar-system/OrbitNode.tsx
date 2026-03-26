import { memo } from 'react';
import { Avatar } from '../ui/Avatar';
import { SOLAR } from '../../constants/solarSystem';
import type { OrbitNode as OrbitNodeType } from '../../utils/orbitCalculator';

interface OrbitNodeProps {
  node: OrbitNodeType;
  isCenter: boolean;
  isHovered: boolean;
  onHover: (id: string | null) => void;
  onClick: (id: string) => void;
}

export const OrbitNode = memo(function OrbitNode({
  node,
  isCenter,
  isHovered,
  onHover,
  onClick,
}: OrbitNodeProps) {
  const size = isCenter ? SOLAR.CENTER_SIZE : SOLAR.NODE_SIZE;
  const scale = isHovered && !isCenter ? SOLAR.HOVER_SCALE : 1;
  const nameParts = node.label.split(' ');
  const firstName = nameParts[0] || '';
  const lastName = nameParts.slice(1).join(' ') || '';
  const r = size / 2;

  return (
    <g
      transform={`translate(${node.x}, ${node.y}) scale(${scale})`}
      style={{ cursor: node.isReadOnly ? 'default' : 'pointer', transition: 'transform 300ms ease' }}
      onPointerEnter={() => onHover(node.id)}
      onPointerLeave={() => onHover(null)}
      onClick={() => !node.isReadOnly && onClick(node.id)}
    >
      {/* Category color ring */}
      {node.categoryColor && !isCenter && (
        <circle
          cx={0} cy={0}
          r={r + 3}
          fill="none"
          stroke={node.categoryColor}
          strokeWidth={2}
          strokeOpacity={0.6}
        />
      )}

      {/* Center glow */}
      {isCenter && (
        <circle cx={0} cy={0} r={r + 6} fill="none" stroke="var(--color-accent)" strokeWidth={2} strokeOpacity={0.4}>
          <animate attributeName="stroke-opacity" values="0.4;0.8;0.4" dur="3s" repeatCount="indefinite" />
          <animate attributeName="r" values={`${r + 6};${r + 10};${r + 6}`} dur="3s" repeatCount="indefinite" />
        </circle>
      )}

      {/* Read-only dim overlay ring */}
      {node.isReadOnly && (
        <circle cx={0} cy={0} r={r + 3} fill="none" stroke="var(--color-text-tertiary)" strokeWidth={1} strokeDasharray="3 3" strokeOpacity={0.4} />
      )}

      {/* Avatar via foreignObject */}
      <foreignObject x={-r} y={-r} width={size} height={size}>
        <div
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          {...({ xmlns: 'http://www.w3.org/1999/xhtml' } as any)}
          style={{ width: size, height: size, opacity: node.isReadOnly ? 0.7 : 1 }}
        >
          <Avatar
            photoBlob={node.photoBlob}
            firstName={firstName || 'M'}
            lastName={lastName || 'e'}
            size={size}
          />
        </div>
      </foreignObject>

      {/* Favorite badge — small gold dot at bottom-right */}
      {node.isFavorite && !isCenter && (
        <circle
          cx={r * 0.7}
          cy={r * 0.7}
          r={4}
          fill="#F39C12"
          stroke="var(--color-bg-primary)"
          strokeWidth={1.5}
        />
      )}

      {/* Platform user badge — small blue dot at bottom-left */}
      {node.isOnPlatform && !isCenter && (
        <circle
          cx={-r * 0.7}
          cy={r * 0.7}
          r={4}
          fill="#4A90D9"
          stroke="var(--color-bg-primary)"
          strokeWidth={1.5}
        />
      )}

      {/* Name label */}
      {(isHovered || isCenter) && (
        <text
          y={r + 16}
          textAnchor="middle"
          fill="var(--color-text-primary)"
          fontSize={isCenter ? 14 : 12}
          fontWeight={isCenter ? 600 : 500}
        >
          {node.label}
        </text>
      )}
    </g>
  );
});
