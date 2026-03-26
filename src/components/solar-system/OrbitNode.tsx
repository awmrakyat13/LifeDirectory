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

  return (
    <g
      transform={`translate(${node.x}, ${node.y}) scale(${scale})`}
      style={{ cursor: 'pointer', transition: 'transform 300ms ease' }}
      onPointerEnter={() => onHover(node.id)}
      onPointerLeave={() => onHover(null)}
      onClick={() => onClick(node.id)}
    >
      {/* Category color ring */}
      {node.categoryColor && !isCenter && (
        <circle
          cx={0}
          cy={0}
          r={size / 2 + 3}
          fill="none"
          stroke={node.categoryColor}
          strokeWidth={2}
          strokeOpacity={0.6}
        />
      )}

      {/* Center glow */}
      {isCenter && (
        <circle
          cx={0}
          cy={0}
          r={size / 2 + 6}
          fill="none"
          stroke="var(--color-accent)"
          strokeWidth={2}
          strokeOpacity={0.4}
        >
          <animate
            attributeName="stroke-opacity"
            values="0.4;0.8;0.4"
            dur="3s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="r"
            values={`${size / 2 + 6};${size / 2 + 10};${size / 2 + 6}`}
            dur="3s"
            repeatCount="indefinite"
          />
        </circle>
      )}

      {/* Avatar via foreignObject */}
      <foreignObject
        x={-size / 2}
        y={-size / 2}
        width={size}
        height={size}
      >
        <div
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          {...({ xmlns: 'http://www.w3.org/1999/xhtml' } as any)}
          style={{ width: size, height: size }}
        >
          <Avatar
            photoBlob={node.photoBlob}
            firstName={firstName || 'M'}
            lastName={lastName || 'e'}
            size={size}
          />
        </div>
      </foreignObject>

      {/* Name label */}
      {(isHovered || isCenter) && (
        <text
          y={size / 2 + 16}
          textAnchor="middle"
          fill="var(--color-text-primary)"
          fontSize={isCenter ? 14 : 12}
          fontWeight={isCenter ? 600 : 500}
        >
          {node.label}
        </text>
      )}

      {/* Favorite indicator */}
      {node.isFavorite && !isCenter && (
        <text
          x={size / 2 - 4}
          y={-size / 2 + 4}
          fontSize={10}
          textAnchor="middle"
        >
          {'\u2605'}
        </text>
      )}
    </g>
  );
});
