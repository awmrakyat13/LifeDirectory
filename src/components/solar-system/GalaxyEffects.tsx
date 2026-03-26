import { useMemo, memo } from 'react';

// Deterministic pseudo-random for consistent star field
function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return s / 2147483647;
  };
}

interface StarFieldProps {
  count?: number;
  spread?: number;
}

export const StarField = memo(function StarField({ count = 400, spread = 2000 }: StarFieldProps) {
  const stars = useMemo(() => {
    const rand = seededRandom(42);
    return Array.from({ length: count }, () => ({
      cx: (rand() - 0.5) * spread * 2,
      cy: (rand() - 0.5) * spread * 2,
      r: rand() * 1.5 + 0.3,
      opacity: rand() * 0.6 + 0.1,
      twinkle: rand() > 0.85, // 15% of stars twinkle
      delay: rand() * 5,
    }));
  }, [count, spread]);

  return (
    <g>
      {stars.map((star, i) => (
        <circle
          key={i}
          cx={star.cx}
          cy={star.cy}
          r={star.r}
          fill="white"
          opacity={star.opacity}
        >
          {star.twinkle && (
            <animate
              attributeName="opacity"
              values={`${star.opacity};${star.opacity * 0.2};${star.opacity}`}
              dur={`${3 + star.delay}s`}
              repeatCount="indefinite"
              begin={`${star.delay}s`}
            />
          )}
        </circle>
      ))}
    </g>
  );
});

export function GalaxyFilters() {
  return (
    <defs>
      {/* Glow filter for nodes */}
      <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>

      {/* Stronger glow for center node */}
      <filter id="glowStrong" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>

      {/* Soft glow for orbit rings */}
      <filter id="ringGlow" x="-10%" y="-10%" width="120%" height="120%">
        <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>

      {/* Connection line glow */}
      <filter id="lineGlow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur in="SourceGraphic" stdDeviation="1.5" />
      </filter>

      {/* Nebula gradient blobs */}
      <radialGradient id="nebula1" cx="30%" cy="40%" r="50%">
        <stop offset="0%" stopColor="#4A90D9" stopOpacity="0.08" />
        <stop offset="100%" stopColor="#4A90D9" stopOpacity="0" />
      </radialGradient>
      <radialGradient id="nebula2" cx="70%" cy="60%" r="40%">
        <stop offset="0%" stopColor="#9B59B6" stopOpacity="0.06" />
        <stop offset="100%" stopColor="#9B59B6" stopOpacity="0" />
      </radialGradient>
      <radialGradient id="nebula3" cx="50%" cy="30%" r="35%">
        <stop offset="0%" stopColor="#1ABC9C" stopOpacity="0.04" />
        <stop offset="100%" stopColor="#1ABC9C" stopOpacity="0" />
      </radialGradient>

      {/* Center sun gradient */}
      <radialGradient id="sunGlow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#F39C12" stopOpacity="0.3" />
        <stop offset="40%" stopColor="#E67E22" stopOpacity="0.1" />
        <stop offset="100%" stopColor="#E67E22" stopOpacity="0" />
      </radialGradient>
    </defs>
  );
}

export const NebulaBackground = memo(function NebulaBackground() {
  return (
    <g>
      <rect x="-2000" y="-2000" width="4000" height="4000" fill="url(#nebula1)" />
      <rect x="-2000" y="-2000" width="4000" height="4000" fill="url(#nebula2)" />
      <rect x="-2000" y="-2000" width="4000" height="4000" fill="url(#nebula3)" />
    </g>
  );
});
