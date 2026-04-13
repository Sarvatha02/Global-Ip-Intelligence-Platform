// FILE LOCATION: frontend/src/utils/chartHelpers.jsx

// ==========================================
// VISUALIZATION CONSTANTS & CONFIG
// ==========================================

// Main Chart Color Palette (Standard UI Colors)
export const CHART_COLORS = {
  primary: '#4f46e5',   // Indigo-600
  secondary: '#10b981', // Emerald-500
  tertiary: '#f59e0b',  // Amber-500
  quaternary: '#ef4444', // Red-500
  info: '#3b82f6',      // Blue-500
  danger: '#ef4444',    // Red-500
  gray: '#9ca3af'       // Gray-400
};

// Colors specifically for Status Distribution (Matches Backend Logic)
export const STATUS_COLORS = {
  'ACTIVE': '#10b981',   // Green
  'PENDING': '#f59e0b',  // Orange
  'EXPIRED': '#ef4444',  // Red
  'ABANDONED': '#6b7280', // Gray
  'GRANTED': '#059669',  // Dark Green
  'REJECTED': '#dc2626', // Dark Red
  'FILED': '#3b82f6',    // Blue
  'REGISTERED': '#0891b2' // Cyan
};

// Distinct Colors for Technology Fields/Categories (Cycle through these)
export const FIELD_COLORS = [
  '#4f46e5', // Indigo
  '#8b5cf6', // Violet
  '#ec4899', // Pink
  '#f43f5e', // Rose
  '#f97316', // Orange
  '#f59e0b', // Amber
  '#84cc16', // Lime
  '#10b981', // Emerald
  '#06b6d4', // Cyan
  '#0ea5e9', // Sky
  '#3b82f6', // Blue
  '#6366f1'  // Indigo
];

// ==========================================
// FILTER OPTIONS (Dropdown Data)
// ==========================================

export const DATE_RANGES = [
  { value: 'week', label: 'Last Week' },
  { value: 'month', label: 'Last Month' },
  { value: 'quarter', label: 'Last Quarter' },
  { value: 'year', label: 'Last Year' },
  { value: 'all', label: 'All Time' }
];

export const IP_TYPES = [
  { value: 'all', label: 'All Types' },
  { value: 'patent', label: 'Patents' },
  { value: 'trademark', label: 'Trademarks' },
  { value: 'copyright', label: 'Copyrights' },
  { value: 'design', label: 'Designs' }
];

export const JURISDICTIONS = [
  { value: 'all', label: 'All Regions', flag: '🌍' },
  { value: 'US', label: 'United States', flag: '🇺🇸' },
  { value: 'EP', label: 'Europe (EPO)', flag: '🇪🇺' },
  { value: 'CN', label: 'China', flag: '🇨🇳' },
  { value: 'IN', label: 'India', flag: '🇮🇳' },
  { value: 'JP', label: 'Japan', flag: '🇯🇵' },
  { value: 'KR', label: 'South Korea', flag: '🇰🇷' },
  { value: 'WO', label: 'WIPO (PCT)', flag: '🌐' }
];

export const TECH_FIELDS = [
  { value: 'all', label: 'All Technologies' },
  { value: 'AI & Machine Learning', label: 'AI & Machine Learning' },
  { value: '5G & Wireless', label: '5G & Wireless' },
  { value: 'Biotechnology', label: 'Biotechnology' },
  { value: 'Autonomous Vehicles', label: 'Autonomous Vehicles' },
  { value: 'Blockchain', label: 'Blockchain' },
  { value: 'Cloud Computing', label: 'Cloud Computing' },
  { value: 'Cybersecurity', label: 'Cybersecurity' },
  { value: 'IoT', label: 'Internet of Things' },
  { value: 'Nanotechnology', label: 'Nanotechnology' },
  { value: 'Quantum Computing', label: 'Quantum Computing' },
  { value: 'Robotics', label: 'Robotics' },
  { value: 'Semiconductors', label: 'Semiconductors' }
];

// ==========================================
// FORMATTERS & UTILITIES
// ==========================================

// Format large numbers (e.g., 1.5K, 2M)
export const formatNumber = (num) => {
  if (num === undefined || num === null) return '0';
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
};

// Format percentages with sign (e.g., +5.5%, -2.1%)
export const formatPercent = (val) => {
  if (val === undefined || val === null) return '0%';
  return `${val >= 0 ? '+' : ''}${val.toFixed(1)}%`;
};

// Determine visual indicator for growth stats
export const getGrowthIndicator = (growth) => {
  if (growth > 5) return { color: 'text-emerald-600', bgColor: 'bg-emerald-100', icon: 'Up', symbol: '↑' };
  if (growth < -5) return { color: 'text-red-600', bgColor: 'bg-red-100', icon: 'Down', symbol: '↓' };
  return { color: 'text-gray-600', bgColor: 'bg-gray-100', icon: 'Flat', symbol: '–' };
};

// Custom Tooltip Formatter for Recharts
export const customTooltipFormatter = (value, name) => {
  // Try to match name to a readable label if possible
  const readableName = name.charAt(0).toUpperCase() + name.slice(1);
  return [formatNumber(value), readableName];
};

// ==========================================
// CHART CONFIGURATIONS (Recharts props)
// ==========================================

export const CHART_MARGIN = { top: 20, right: 30, left: 20, bottom: 5 };

export const CARTESIAN_GRID_CONFIG = {
  strokeDasharray: "3 3",
  vertical: false,
  stroke: "#e5e7eb"
};

export const TOOLTIP_CONFIG = {
  contentStyle: { 
    backgroundColor: '#fff', 
    border: '1px solid #e5e7eb', 
    borderRadius: '8px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    padding: '10px'
  },
  itemStyle: { color: '#374151', fontSize: '12px', fontWeight: '500' },
  cursor: { fill: '#f3f4f6', opacity: 0.6 }
};

export const LEGEND_CONFIG = {
  verticalAlign: "top",
  height: 36,
  iconType: "circle",
  wrapperStyle: { paddingTop: '10px' }
};