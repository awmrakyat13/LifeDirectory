export const SOLAR = {
  VIEW_SIZE: 2000,
  CENTER_SIZE: 60,
  NODE_SIZE: 44,
  BASE_RADIUS: 160,
  MIN_ZOOM: 0.3,
  MAX_ZOOM: 3.0,
  INITIAL_VB: 700,
  DRILLDOWN_MS: 300,
  HOVER_SCALE: 1.15,
  LINE_OPACITY: 0.15,
  LINE_HOVER_OPACITY: 0.5,
  ROTATION_DURATION: 120,
} as const;

// Logarithmic ring spacing — inner rings breathe, outer rings compress
export function getRingRadius(ringNum: number): number {
  if (ringNum <= 0) return 0;
  if (ringNum === 1) return SOLAR.BASE_RADIUS;
  // Log curve: each successive gap shrinks
  // Ring 1: 160, Ring 2: 270, Ring 3: 360, Ring 4: 430, Ring 5: 485, Ring 6: 530
  const firstGap = 110;
  let radius = SOLAR.BASE_RADIUS;
  for (let i = 2; i <= ringNum; i++) {
    const gap = firstGap / Math.pow(i - 1, 0.4);
    radius += gap;
  }
  return Math.round(radius);
}
