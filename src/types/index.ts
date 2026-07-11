/* ========================================
   StadiumIQ AI — TypeScript Type Definitions
   ======================================== */

// ---- User & Auth ----
export type UserRole = 'admin' | 'operations' | 'security' | 'medical' | 'volunteer' | 'fan';

export interface User {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: UserRole;
  createdAt: string;
}

// ---- KPI & Dashboard ----
export interface KPIData {
  id: string;
  label: string;
  value: number;
  unit?: string;
  change: number; // percentage change
  changeType: 'increase' | 'decrease' | 'neutral';
  icon: string;
  color: string;
  sparkline?: number[];
}

export interface DashboardMetrics {
  attendance: number;
  maxCapacity: number;
  crowdDensity: number;
  avgWaitTime: number;
  gateStatus: GateStatus[];
  parkingUsage: number;
  medicalIncidents: number;
  securityAlerts: number;
  foodQueueAvg: number;
  weather: WeatherData;
  aiRiskScore: number;
}

// ---- Gates ----
export interface GateStatus {
  id: string;
  name: string;
  status: 'open' | 'closed' | 'congested' | 'restricted';
  throughput: number;
  maxCapacity: number;
  waitTime: number;
  staffCount: number;
}

// ---- Weather ----
export interface WeatherData {
  temperature: number;
  condition: 'sunny' | 'cloudy' | 'rainy' | 'stormy' | 'windy' | 'clear';
  humidity: number;
  windSpeed: number;
  feelsLike: number;
  uvIndex: number;
}

// ---- Crowd Intelligence ----
export interface CrowdZone {
  id: string;
  name: string;
  currentOccupancy: number;
  maxCapacity: number;
  density: number; // 0-100
  trend: 'increasing' | 'decreasing' | 'stable';
  riskLevel: 'low' | 'moderate' | 'high' | 'critical';
}

export interface QueuePrediction {
  gateId: string;
  gateName: string;
  currentWait: number;
  predicted15Min: number;
  predicted30Min: number;
  predicted60Min: number;
  recommendation: string;
}

export interface CrowdFlow {
  from: string;
  to: string;
  volume: number;
  direction: 'inbound' | 'outbound' | 'internal';
}

// ---- Operations ----
export interface Incident {
  id: string;
  title: string;
  description: string;
  type: 'security' | 'medical' | 'maintenance' | 'crowd' | 'weather' | 'technical';
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'in-progress' | 'resolved' | 'escalated';
  location: string;
  reportedAt: string;
  resolvedAt?: string;
  assignedTo?: string;
  aiSummary?: string;
  aiRecommendation?: string;
}

export interface StaffMember {
  id: string;
  name: string;
  role: string;
  zone: string;
  status: 'available' | 'busy' | 'break' | 'off-duty';
  avatar?: string;
  phone: string;
}

export interface Equipment {
  id: string;
  name: string;
  type: string;
  status: 'operational' | 'warning' | 'critical' | 'offline';
  location: string;
  lastChecked: string;
  healthScore: number;
}

// ---- Security ----
export interface SecurityAlert {
  id: string;
  type: 'unauthorized-access' | 'suspicious-activity' | 'bag-screening' | 'cctv' | 'perimeter' | 'threat';
  severity: 'low' | 'medium' | 'high' | 'critical';
  location: string;
  description: string;
  timestamp: string;
  status: 'active' | 'investigating' | 'resolved' | 'false-alarm';
  cameraId?: string;
  aiAssessment?: string;
}

export interface ThreatLevel {
  overall: 'low' | 'moderate' | 'elevated' | 'high' | 'critical';
  score: number; // 0-100
  factors: string[];
  lastUpdated: string;
}

// ---- Medical ----
export interface MedicalCase {
  id: string;
  type: 'cardiac' | 'heat-stroke' | 'fracture' | 'allergic' | 'fainting' | 'intoxication' | 'other';
  severity: 'minor' | 'moderate' | 'severe' | 'critical';
  location: string;
  patientAge?: number;
  patientGender?: string;
  description: string;
  status: 'waiting' | 'treating' | 'stabilized' | 'transported' | 'released';
  reportedAt: string;
  assignedMedic?: string;
  responseTime?: number;
}

export interface Ambulance {
  id: string;
  callSign: string;
  status: 'available' | 'dispatched' | 'en-route' | 'on-scene' | 'transporting' | 'returning';
  location: string;
  eta?: number;
  currentCase?: string;
}

// ---- Parking ----
export interface ParkingLot {
  id: string;
  name: string;
  totalSpaces: number;
  occupiedSpaces: number;
  evChargers: number;
  evChargersAvailable: number;
  walkingTime: number;
  status: 'open' | 'full' | 'closing' | 'closed';
  trafficLevel: 'low' | 'moderate' | 'heavy' | 'gridlock';
}

// ---- Food & Vendors ----
export interface FoodVendor {
  id: string;
  name: string;
  type: 'fast-food' | 'beverages' | 'snacks' | 'premium' | 'vegan' | 'halal';
  location: string;
  queueLength: number;
  avgWaitTime: number;
  status: 'open' | 'busy' | 'closing' | 'closed';
  revenue: number;
  popularItems: MenuItem[];
  inventoryStatus: 'stocked' | 'low' | 'critical' | 'empty';
}

export interface MenuItem {
  name: string;
  price: number;
  sold: number;
  inStock: number;
}

// ---- Announcements ----
export interface Announcement {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'emergency' | 'general';
  language: string;
  translations?: Record<string, string>;
  createdAt: string;
  publishedAt?: string;
  status: 'draft' | 'published' | 'archived';
  generatedByAI: boolean;
}

// ---- Analytics ----
export interface TimeSeriesData {
  timestamp: string;
  value: number;
  label?: string;
}

export interface ChartDataPoint {
  name: string;
  value: number;
  color?: string;
  [key: string]: string | number | undefined;
}

// ---- AI ----
export interface AIInsight {
  id: string;
  type: 'recommendation' | 'prediction' | 'alert' | 'summary' | 'sop';
  title: string;
  content: string;
  confidence: number;
  priority: 'low' | 'medium' | 'high';
  category: string;
  createdAt: string;
  actionable: boolean;
  actions?: AIAction[];
}

export interface AIAction {
  id: string;
  label: string;
  type: 'primary' | 'secondary';
  action: string;
}

export interface AIConversation {
  id: string;
  messages: AIMessage[];
  language: string;
  context: string;
}

export interface AIMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  language: string;
}

// ---- Notifications ----
export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  read: boolean;
  timestamp: string;
  link?: string;
  module?: string;
}

// ---- Navigation ----
export interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: string;
  badge?: number;
  roles: UserRole[];
  children?: NavItem[];
}

// ---- Stadium Map ----
export interface MapZone {
  id: string;
  name: string;
  type: 'entrance' | 'seating' | 'parking' | 'medical' | 'restroom' | 'restaurant' | 'emergency-exit' | 'security' | 'vip';
  path: string; // SVG path
  occupancy: number;
  maxCapacity: number;
  status: 'normal' | 'busy' | 'full' | 'closed' | 'emergency';
}
