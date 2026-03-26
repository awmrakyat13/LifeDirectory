export const PRESET_COLORS = [
  '#E74C3C', '#3498DB', '#2ECC71', '#F39C12', '#9B59B6',
  '#1ABC9C', '#E67E22', '#34495E', '#E91E63', '#00BCD4',
  '#8BC34A', '#FF5722',
] as const satisfies readonly string[];

export type PresetColor = (typeof PRESET_COLORS)[number];
