import type { NavItem } from '@/types';

export const APP_NAME = 'StadiumIQ AI';
export const APP_TAGLINE = 'AI-Powered Smart Stadium Operations & Fan Experience Platform';
export const APP_VERSION = '1.0.0';

export const STADIUM_NAME = 'MetLife Stadium';
export const EVENT_NAME = 'FIFA World Cup 2026™';

// Real World Cup 2026 Match Schedule for MetLife Stadium
export const MATCH_SCHEDULE = [
  { date: '2026-06-15', time: '18:00', name: 'Argentina vs France — Group Stage', status: 'completed' },
  { date: '2026-06-22', time: '15:00', name: 'Spain vs Uruguay — Group Stage', status: 'completed' },
  { date: '2026-06-30', time: '20:00', name: 'United States vs Italy — Round of 32', status: 'completed' },
  { date: '2026-07-05', time: '18:00', name: 'England vs Portugal — Quarter Final', status: 'completed' },
  { date: '2026-07-10', time: '20:00', name: 'Brazil vs Germany — Semi Final', status: 'live' },
  { date: '2026-07-19', time: '19:00', name: 'FIFA World Cup Final 2026™', status: 'upcoming' },
];

export function getCurrentMatch() {
  // Check the current date on the user's system
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  const dateStr = `${year}-${month}-${day}`;

  // Find match for today
  const todaysMatch = MATCH_SCHEDULE.find(m => m.date === dateStr);
  if (todaysMatch) {
    return todaysMatch;
  }

  // Fallback to the latest live match (Brazil vs Germany on July 10, 2026) for demo purposes
  return MATCH_SCHEDULE.find(m => m.status === 'live') || MATCH_SCHEDULE[MATCH_SCHEDULE.length - 1];
}

export const LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'pt', name: 'Português', flag: '🇧🇷' },
  { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
] as const;

export const ROLES = [
  { value: 'admin', label: 'Administrator', description: 'Full system access' },
  { value: 'operations', label: 'Operations Manager', description: 'Stadium operations & logistics' },
  { value: 'security', label: 'Security Officer', description: 'Security monitoring & response' },
  { value: 'medical', label: 'Medical Staff', description: 'Medical response & coordination' },
  { value: 'volunteer', label: 'Volunteer', description: 'Fan assistance & guidance' },
  { value: 'fan', label: 'Fan', description: 'Fan experience features' },
] as const;

export const NAV_ITEMS: NavItem[] = [
  {
    id: 'dashboard',
    label: 'Executive Dashboard',
    href: '/dashboard',
    icon: 'LayoutDashboard',
    roles: ['admin', 'operations', 'security', 'medical', 'volunteer', 'fan'],
  },
  {
    id: 'live-map',
    label: 'Live Stadium Map',
    href: '/dashboard/live-map',
    icon: 'Map',
    roles: ['admin', 'operations', 'security', 'medical', 'volunteer'],
  },
  {
    id: 'crowd',
    label: 'Crowd Intelligence',
    href: '/dashboard/crowd',
    icon: 'Users',
    roles: ['admin', 'operations', 'security'],
  },
  {
    id: 'operations',
    label: 'Operations Command',
    href: '/dashboard/operations',
    icon: 'Settings',
    roles: ['admin', 'operations'],
  },
  {
    id: 'incident-management',
    label: 'Incident Management',
    href: '/dashboard/incident-management',
    icon: 'ShieldAlert',
    roles: ['admin', 'operations', 'security', 'medical'],
  },
  {
    id: 'security',
    label: 'Security Center',
    href: '/dashboard/security',
    icon: 'Shield',
    roles: ['admin', 'security'],
  },
  {
    id: 'medical',
    label: 'Medical Response',
    href: '/dashboard/medical',
    icon: 'Heart',
    roles: ['admin', 'medical'],
  },
  {
    id: 'parking',
    label: 'Parking Management',
    href: '/dashboard/parking',
    icon: 'Car',
    roles: ['admin', 'operations', 'fan'],
  },
  {
    id: 'food-vendors',
    label: 'Food & Vendor Analytics',
    href: '/dashboard/food-vendors',
    icon: 'UtensilsCrossed',
    roles: ['admin', 'operations'],
  },
  {
    id: 'fan-concierge',
    label: 'Fan Concierge',
    href: '/dashboard/fan-concierge',
    icon: 'MessageCircle',
    roles: ['admin', 'operations', 'volunteer', 'fan'],
  },
  {
    id: 'announcements',
    label: 'Announcements',
    href: '/dashboard/announcements',
    icon: 'Megaphone',
    roles: ['admin', 'operations'],
  },
  {
    id: 'ai-recommendations',
    label: 'AI Recommendations',
    href: '/dashboard/ai-recommendations',
    icon: 'Brain',
    roles: ['admin', 'operations', 'security', 'medical'],
  },
  {
    id: 'analytics',
    label: 'Analytics Dashboard',
    href: '/dashboard/analytics',
    icon: 'BarChart3',
    roles: ['admin', 'operations'],
  },
  {
    id: 'reports',
    label: 'Daily Reports',
    href: '/dashboard/reports',
    icon: 'FileText',
    roles: ['admin', 'operations'],
  },
  {
    id: 'settings',
    label: 'System Settings',
    href: '/dashboard/settings',
    icon: 'Sliders',
    roles: ['admin', 'operations'],
  },
  {
    id: 'profile',
    label: 'User Profile',
    href: '/dashboard/profile',
    icon: 'User',
    roles: ['admin', 'operations', 'security', 'medical', 'volunteer', 'fan'],
  },
];

export const CHART_COLORS = {
  primary: '#3B82F6',
  accent: '#D4AF37',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  info: '#06B6D4',
  purple: '#8B5CF6',
  pink: '#EC4899',
  indigo: '#6366F1',
  teal: '#14B8A6',
};

export const CHART_PALETTE = [
  '#3B82F6',
  '#D4AF37',
  '#10B981',
  '#F59E0B',
  '#8B5CF6',
  '#EC4899',
  '#06B6D4',
  '#EF4444',
  '#6366F1',
  '#14B8A6',
];

export const AI_FEATURES = [
  { id: 'incident-summary', name: 'Incident Summarization', icon: 'FileText' },
  { id: 'risk-assessment', name: 'Risk Assessment', icon: 'AlertTriangle' },
  { id: 'crowd-prediction', name: 'Crowd Prediction', icon: 'TrendingUp' },
  { id: 'queue-prediction', name: 'Queue Prediction', icon: 'Clock' },
  { id: 'sop-generator', name: 'SOP Generator', icon: 'ClipboardList' },
  { id: 'announcement', name: 'Announcement Generator', icon: 'Megaphone' },
  { id: 'staff-recommend', name: 'Staff Recommendations', icon: 'UserCheck' },
  { id: 'translation', name: 'Multi-Language Translation', icon: 'Globe' },
  { id: 'daily-report', name: 'Daily Operations Report', icon: 'FileBarChart' },
  { id: 'executive-summary', name: 'Executive Summary', icon: 'Briefcase' },
  { id: 'fan-assist', name: 'Fan Assistance', icon: 'MessageCircle' },
  { id: 'emergency-plan', name: 'Emergency Planning', icon: 'Siren' },
  { id: 'predictive', name: 'Predictive Analytics', icon: 'Brain' },
] as const;
