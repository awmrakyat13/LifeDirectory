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
  // Depth scaling: outer rings are slightly smaller/dimmer
  const depthScale = isCenter ? 1 : Math.max(0.7, 1 - node.ring * 0.06);
  const depthOpacity = isCenter ? 1 : Math.max(0.6, 1 - node.ring * 0.08);
  const baseSize = isCenter ? SOLAR.CENTER_SIZE : SOLAR.NODE_SIZE;
  const size = Math.round(baseSize * depthScale);
  const scale = isHovered && !isCenter ? SOLAR.HOVER_SCALE : 1;
  const nameParts = node.label.split(' ');
  const firstName = nameParts[0] || '';
  const lastName = nameParts.slice(1).join(' ') || '';
  const r = size / 2;
  const filterAttr = isCenter ? 'url(#glowStrong)' : isHovered ? 'url(#glow)' : undefined;

  return (
    <g
      transform={`translate(${node.x}, ${node.y}) scale(${scale})`}
      style={{ cursor: node.id === 'circle-center' ? 'default' : 'pointer', transition: 'transform 300ms ease' }}
      onPointerEnter={() => onHover(node.id)}
      onPointerLeave={() => onHover(null)}
      onClick={() => node.id !== 'circle-center' && onClick(node.id)}
      filter={filterAttr}
      opacity={depthOpacity}
    >
      {/* Center sun glow */}
      {isCenter && (
        <>
          <circle cx={0} cy={0} r={r + 20} fill="url(#sunGlow)" />
          <circle cx={0} cy={0} r={r + 6} fill="none" stroke="#F39C12" strokeWidth={1.5} strokeOpacity={0.3}>
            <animate attributeName="stroke-opacity" values="0.3;0.6;0.3" dur="3s" repeatCount="indefinite" />
            <animate attributeName="r" values={`${r + 6};${r + 10};${r + 6}`} dur="3s" repeatCount="indefinite" />
          </circle>
        </>
      )}

      {/* Category color ring with glow */}
      {node.categoryColor && !isCenter && (
        <circle
          cx={0} cy={0} r={r + 3}
          fill="none"
          stroke={node.categoryColor}
          strokeWidth={2}
          strokeOpacity={0.5}
        />
      )}

      {/* Read-only indicator */}
      {node.isReadOnly && !isCenter && (
        <circle cx={0} cy={0} r={r + 3} fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth={1} strokeDasharray="3 3" />
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

      {/* Favorite badge — small gold dot */}
      {node.isFavorite && !isCenter && (
        <circle cx={r * 0.7} cy={r * 0.7} r={4} fill="#F39C12" stroke="#0a0a1a" strokeWidth={1.5} />
      )}

      {/* Platform user badge — small blue dot */}
      {node.isOnPlatform && !isCenter && (
        <circle cx={-r * 0.7} cy={r * 0.7} r={4} fill="#4A90D9" stroke="#0a0a1a" strokeWidth={1.5} />
      )}

      {/* Add hint on read-only nodes */}
      {node.isReadOnly && node.shareableInfo && !isCenter && (
        <g>
          <circle cx={r * 0.7} cy={-r * 0.7} r={5} fill="#4A90D9" stroke="#0a0a1a" strokeWidth={1.5} />
          <text x={r * 0.7} y={-r * 0.7 + 3.5} textAnchor="middle" fill="white" fontSize={9} fontWeight={700}>+</text>
        </g>
      )}

      {/* Name label — always white on dark galaxy bg */}
      {(isHovered || isCenter) && (
        <text
          y={r + 16}
          textAnchor="middle"
          fill="rgba(255, 255, 255, 0.9)"
          fontSize={isCenter ? 14 : 12}
          fontWeight={isCenter ? 600 : 500}
        >
          {node.label}
          {node.isReadOnly && node.shareableInfo && !isCenter && (
            <tspan fill="#4A90D9" fontSize={10}> (tap to add)</tspan>
          )}
        </text>
      )}
    </g>
  );
});
