export interface AppState {
  rotate: boolean;
  bloomIntensity: number;
  lightColor: string;
  ornamentColor: string;
  showSnow: boolean;
  isScattered: boolean;
}

export interface TreeProps {
  ornamentColor: string;
  isScattered: boolean;
}

export interface OrnamentsProps {
  count: number;
  color: string;
  isScattered: boolean;
}

export const GOLD_COLOR = "#FFD700";
export const SILVER_COLOR = "#C0C0C0";
export const PALE_PINK = "#FFD1DC"; // Pastel Pink
export const EMERALD_COLOR = "#043927";
export const WARM_LIGHT = "#ffaa44";
export const COOL_LIGHT = "#ccddff";