import { useState, useCallback, useRef, type RefObject } from 'react';
import { SOLAR } from '../constants/solarSystem';

export interface ViewBox {
  x: number;
  y: number;
  w: number;
  h: number;
}

const INIT = SOLAR.INITIAL_VB;
const MIN_VB = SOLAR.VIEW_SIZE / SOLAR.MAX_ZOOM / 2;
const MAX_VB = SOLAR.VIEW_SIZE / SOLAR.MIN_ZOOM;

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

export function useSvgViewBox(svgRef: RefObject<SVGSVGElement | null>) {
  const [viewBox, setViewBox] = useState<ViewBox>({ x: -INIT / 2, y: -INIT / 2, w: INIT, h: INIT });
  const panState = useRef<{ active: boolean; startX: number; startY: number }>({ active: false, startX: 0, startY: 0 });
  const pinchRef = useRef<number | null>(null);

  const onWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const factor = e.deltaY > 0 ? 1.08 : 1 / 1.08;
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();

    setViewBox((prev) => {
      const newW = clamp(prev.w * factor, MIN_VB, MAX_VB);
      const newH = clamp(prev.h * factor, MIN_VB, MAX_VB);
      const mx = (e.clientX - rect.left) / rect.width;
      const my = (e.clientY - rect.top) / rect.height;
      const cursorX = prev.x + mx * prev.w;
      const cursorY = prev.y + my * prev.h;
      return { x: cursorX - mx * newW, y: cursorY - my * newH, w: newW, h: newH };
    });
  }, [svgRef]);

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    if (e.button !== 0) return;
    panState.current = { active: true, startX: e.clientX, startY: e.clientY };
    (e.target as Element).setPointerCapture?.(e.pointerId);
  }, []);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!panState.current.active) return;
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const dx = ((e.clientX - panState.current.startX) / rect.width);
    const dy = ((e.clientY - panState.current.startY) / rect.height);

    setViewBox((prev) => ({
      ...prev,
      x: prev.x - dx * prev.w,
      y: prev.y - dy * prev.h,
    }));
    panState.current.startX = e.clientX;
    panState.current.startY = e.clientY;
  }, [svgRef]);

  const onPointerUp = useCallback(() => {
    panState.current.active = false;
  }, []);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      e.preventDefault();
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      if (pinchRef.current !== null) {
        const factor = pinchRef.current / dist;
        setViewBox((prev) => {
          const newW = clamp(prev.w * factor, MIN_VB, MAX_VB);
          const newH = clamp(prev.h * factor, MIN_VB, MAX_VB);
          const cx = prev.x + prev.w / 2;
          const cy = prev.y + prev.h / 2;
          return { x: cx - newW / 2, y: cy - newH / 2, w: newW, h: newH };
        });
      }
      pinchRef.current = dist;
    }
  }, []);

  const onTouchEnd = useCallback(() => {
    pinchRef.current = null;
  }, []);

  const resetView = useCallback(() => {
    setViewBox({ x: -INIT / 2, y: -INIT / 2, w: INIT, h: INIT });
  }, []);

  return {
    viewBox,
    svgProps: {
      onWheel,
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onTouchMove,
      onTouchEnd,
    },
    resetView,
  };
}
