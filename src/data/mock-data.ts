import type {
  KPIData, GateStatus, WeatherData, Incident, StaffMember,
  Equipment, SecurityAlert, MedicalCase, Ambulance, ParkingLot,
  FoodVendor, CrowdZone, QueuePrediction, AppNotification, AIInsight,
  Announcement, TimeSeriesData, ChartDataPoint, ThreatLevel,
} from '@/types';

// ========================================
// Dashboard KPIs
// ========================================

export const dashboardKPIs: KPIData[] = [
  { id: 'attendance', label: 'Current Attendance', value: 67842, unit: 'fans', change: 12.4, changeType: 'increase', icon: 'Users', color: '#3B82F6', sparkline: [52000, 55000, 58000, 60000, 62000, 65000, 63000, 66000, 67000, 67500, 67800, 67842] },
  { id: 'capacity', label: 'Stadium Capacity', value: 82500, unit: 'max', change: 0, changeType: 'neutral', icon: 'Building2', color: '#8B5CF6', sparkline: [82500, 82500, 82500, 82500, 82500, 82500, 82500, 82500, 82500, 82500, 82500, 82500] },
  { id: 'density', label: 'Crowd Density', value: 82.2, unit: '%', change: 3.1, changeType: 'increase', icon: 'Activity', color: '#F59E0B', sparkline: [65, 68, 72, 74, 76, 78, 79, 80, 80.5, 81, 81.8, 82.2] },
  { id: 'wait-time', label: 'Avg. Wait Time', value: 8.5, unit: 'min', change: -2.3, changeType: 'decrease', icon: 'Clock', color: '#10B981', sparkline: [14, 13, 12, 11, 10.5, 10, 9.5, 9, 8.8, 8.6, 8.5, 8.5] },
  { id: 'gates', label: 'Gates Open', value: 14, unit: '/16', change: 0, changeType: 'neutral', icon: 'DoorOpen', color: '#06B6D4', sparkline: [8, 10, 12, 14, 14, 14, 14, 14, 14, 14, 14, 14] },
  { id: 'parking', label: 'Parking Usage', value: 91.3, unit: '%', change: 5.2, changeType: 'increase', icon: 'Car', color: '#EC4899', sparkline: [45, 52, 60, 68, 74, 79, 83, 86, 88, 89.5, 90.8, 91.3] },
  { id: 'medical', label: 'Medical Incidents', value: 7, unit: 'active', change: 2, changeType: 'increase', icon: 'Heart', color: '#EF4444', sparkline: [2, 3, 3, 4, 5, 4, 5, 6, 5, 6, 7, 7] },
  { id: 'security', label: 'Security Alerts', value: 3, unit: 'active', change: -1, changeType: 'decrease', icon: 'Shield', color: '#D4AF37', sparkline: [5, 6, 4, 5, 4, 3, 4, 3, 4, 3, 3, 3] },
  { id: 'food-queue', label: 'Food Queue Avg.', value: 12.3, unit: 'min', change: 1.5, changeType: 'increase', icon: 'UtensilsCrossed', color: '#F97316', sparkline: [8, 9, 10, 10.5, 11, 11.5, 12, 12, 11.8, 12, 12.2, 12.3] },
  { id: 'weather', label: 'Temperature', value: 28, unit: '°C', change: 0.5, changeType: 'increase', icon: 'Sun', color: '#FBBF24', sparkline: [24, 25, 26, 26.5, 27, 27, 27.5, 27.5, 28, 28, 28, 28] },
  { id: 'risk-score', label: 'AI Risk Score', value: 34, unit: '/100', change: -5, changeType: 'decrease', icon: 'Brain', color: '#10B981', sparkline: [42, 40, 38, 37, 36, 36, 35, 35, 34, 34, 34, 34] },
  { id: 'volunteers', label: 'Active Volunteers', value: 248, unit: 'staff', change: 0, changeType: 'neutral', icon: 'UserCheck', color: '#14B8A6', sparkline: [200, 215, 230, 240, 245, 248, 248, 248, 248, 248, 248, 248] },
];

// ========================================
// Gate Status
// ========================================

export const gateStatuses: GateStatus[] = [
  { id: 'g1', name: 'Gate A1', status: 'open', throughput: 342, maxCapacity: 500, waitTime: 5, staffCount: 8 },
  { id: 'g2', name: 'Gate A2', status: 'open', throughput: 289, maxCapacity: 500, waitTime: 7, staffCount: 6 },
  { id: 'g3', name: 'Gate B1', status: 'congested', throughput: 478, maxCapacity: 500, waitTime: 18, staffCount: 10 },
  { id: 'g4', name: 'Gate B2', status: 'open', throughput: 198, maxCapacity: 500, waitTime: 3, staffCount: 5 },
  { id: 'g5', name: 'Gate C1', status: 'open', throughput: 367, maxCapacity: 500, waitTime: 8, staffCount: 7 },
  { id: 'g6', name: 'Gate C2', status: 'closed', throughput: 0, maxCapacity: 500, waitTime: 0, staffCount: 2 },
  { id: 'g7', name: 'Gate D1', status: 'congested', throughput: 456, maxCapacity: 500, waitTime: 22, staffCount: 9 },
  { id: 'g8', name: 'Gate D2', status: 'open', throughput: 234, maxCapacity: 500, waitTime: 6, staffCount: 6 },
  { id: 'g9', name: 'Gate E1', status: 'open', throughput: 312, maxCapacity: 400, waitTime: 9, staffCount: 7 },
  { id: 'g10', name: 'Gate E2', status: 'restricted', throughput: 145, maxCapacity: 400, waitTime: 4, staffCount: 4 },
  { id: 'g11', name: 'Gate F1', status: 'open', throughput: 278, maxCapacity: 400, waitTime: 6, staffCount: 6 },
  { id: 'g12', name: 'Gate F2', status: 'open', throughput: 356, maxCapacity: 400, waitTime: 10, staffCount: 7 },
  { id: 'g13', name: 'VIP Gate 1', status: 'open', throughput: 89, maxCapacity: 200, waitTime: 2, staffCount: 4 },
  { id: 'g14', name: 'VIP Gate 2', status: 'open', throughput: 67, maxCapacity: 200, waitTime: 1, staffCount: 4 },
  { id: 'g15', name: 'Media Gate', status: 'open', throughput: 45, maxCapacity: 150, waitTime: 3, staffCount: 3 },
  { id: 'g16', name: 'Service Gate', status: 'closed', throughput: 0, maxCapacity: 100, waitTime: 0, staffCount: 1 },
];

// ========================================
// Weather
// ========================================

export const weatherData: WeatherData = {
  temperature: 28,
  condition: 'clear',
  humidity: 62,
  windSpeed: 12,
  feelsLike: 31,
  uvIndex: 6,
};

// ========================================
// Attendance Trend
// ========================================

export const attendanceTrend: TimeSeriesData[] = [
  { timestamp: '14:00', value: 8200 },
  { timestamp: '14:30', value: 15400 },
  { timestamp: '15:00', value: 24600 },
  { timestamp: '15:30', value: 32100 },
  { timestamp: '16:00', value: 41500 },
  { timestamp: '16:30', value: 48900 },
  { timestamp: '17:00', value: 54200 },
  { timestamp: '17:30', value: 58700 },
  { timestamp: '18:00', value: 62400 },
  { timestamp: '18:30', value: 65100 },
  { timestamp: '19:00', value: 66800 },
  { timestamp: '19:30', value: 67842 },
];

// ========================================
// Crowd Zones
// ========================================

export const crowdZones: CrowdZone[] = [
  { id: 'north-stand', name: 'North Stand', currentOccupancy: 18200, maxCapacity: 20000, density: 91, trend: 'stable', riskLevel: 'moderate' },
  { id: 'south-stand', name: 'South Stand', currentOccupancy: 17800, maxCapacity: 20000, density: 89, trend: 'increasing', riskLevel: 'moderate' },
  { id: 'east-stand', name: 'East Stand', currentOccupancy: 16500, maxCapacity: 18000, density: 92, trend: 'stable', riskLevel: 'high' },
  { id: 'west-stand', name: 'West Stand', currentOccupancy: 15342, maxCapacity: 18000, density: 85, trend: 'decreasing', riskLevel: 'low' },
  { id: 'vip-north', name: 'VIP North', currentOccupancy: 2800, maxCapacity: 3000, density: 93, trend: 'stable', riskLevel: 'low' },
  { id: 'vip-south', name: 'VIP South', currentOccupancy: 2650, maxCapacity: 3000, density: 88, trend: 'stable', riskLevel: 'low' },
  { id: 'concourse-a', name: 'Concourse A', currentOccupancy: 3200, maxCapacity: 4000, density: 80, trend: 'increasing', riskLevel: 'moderate' },
  { id: 'concourse-b', name: 'Concourse B', currentOccupancy: 2800, maxCapacity: 4000, density: 70, trend: 'decreasing', riskLevel: 'low' },
  { id: 'food-court', name: 'Food Court', currentOccupancy: 1500, maxCapacity: 2000, density: 75, trend: 'increasing', riskLevel: 'moderate' },
  { id: 'fan-zone', name: 'Fan Zone', currentOccupancy: 4200, maxCapacity: 5000, density: 84, trend: 'stable', riskLevel: 'low' },
];

// ========================================
// Queue Predictions
// ========================================

export const queuePredictions: QueuePrediction[] = [
  { gateId: 'g1', gateName: 'Gate A1', currentWait: 5, predicted15Min: 4, predicted30Min: 3, predicted60Min: 2, recommendation: 'Queue is decreasing. Normal operation.' },
  { gateId: 'g3', gateName: 'Gate B1', currentWait: 18, predicted15Min: 22, predicted30Min: 15, predicted60Min: 8, recommendation: 'Deploy 3 additional staff members. Open auxiliary lane.' },
  { gateId: 'g7', gateName: 'Gate D1', currentWait: 22, predicted15Min: 25, predicted30Min: 20, predicted60Min: 12, recommendation: 'Redirect fans to Gate D2. Send crowd management team.' },
  { gateId: 'g5', gateName: 'Gate C1', currentWait: 8, predicted15Min: 10, predicted30Min: 12, predicted60Min: 7, recommendation: 'Monitor closely. Pre-position volunteer team.' },
  { gateId: 'g9', gateName: 'Gate E1', currentWait: 9, predicted15Min: 11, predicted30Min: 8, predicted60Min: 5, recommendation: 'Slight increase expected. Normal staffing sufficient.' },
];

// ========================================
// Incidents
// ========================================

export const incidents: Incident[] = [
  { id: 'INC-001', title: 'Crowd Surge at Gate B1', description: 'Unusual crowd density detected near Gate B1. Multiple fans reporting difficulty moving.', type: 'crowd', priority: 'high', status: 'in-progress', location: 'Gate B1 - North Entrance', reportedAt: '2026-07-10T19:12:00Z', assignedTo: 'Team Alpha', aiSummary: 'Crowd density at Gate B1 has exceeded 95% capacity. The surge coincides with late arrivals for the second half. Estimated 2,400 fans still queuing.', aiRecommendation: 'Open auxiliary lanes at Gate B1. Redirect overflow to Gates A2 and C1. Deploy 5 additional security personnel. Activate crowd dispersal announcements in English, Spanish, and Portuguese.' },
  { id: 'INC-002', title: 'Medical Emergency Section 214', description: 'Fan collapsed in Section 214, Row 12. Possible heat stroke.', type: 'medical', priority: 'critical', status: 'in-progress', location: 'Section 214, Row 12', reportedAt: '2026-07-10T19:25:00Z', assignedTo: 'Dr. Martinez', aiSummary: 'Male fan, approximately 55 years old, collapsed during the second half. Temperature at location recorded at 32°C. Symptoms consistent with heat-related illness.', aiRecommendation: 'Immediate first aid with cooling measures. Prepare ambulance for potential hospital transfer. Check surrounding fans for similar symptoms. Increase water distribution in Sections 210-220.' },
  { id: 'INC-003', title: 'Power Fluctuation Sector C', description: 'Intermittent power drops detected in Sector C lighting grid.', type: 'technical', priority: 'medium', status: 'open', location: 'Sector C - Electrical Room 3', reportedAt: '2026-07-10T18:45:00Z', aiSummary: 'Voltage drops of 8-12% detected in Sector C power grid. Pattern suggests overloaded circuit rather than equipment failure.', aiRecommendation: 'Switch non-essential loads to backup grid. Dispatch electrical team to Circuit Panel C-7. Monitor for escalation.' },
  { id: 'INC-004', title: 'Unauthorized Drone Detected', description: 'CCTV and radar detected unauthorized drone activity above the south stand.', type: 'security', priority: 'high', status: 'in-progress', location: 'Airspace - South Stand', reportedAt: '2026-07-10T19:08:00Z', assignedTo: 'Security Team Delta', aiSummary: 'Small recreational drone detected at approximately 120m altitude above south stand. Trajectory analysis suggests operator is located in Parking Lot P3.', aiRecommendation: 'Activate counter-drone protocol. Deploy security team to Parking P3 to locate operator. Notify air traffic control. Maintain visual tracking.' },
  { id: 'INC-005', title: 'Water Main Leak - Restroom B4', description: 'Water leaking from ceiling of Restroom B4, affecting floor safety.', type: 'maintenance', priority: 'medium', status: 'in-progress', location: 'Restroom B4 - Level 2', reportedAt: '2026-07-10T18:30:00Z', assignedTo: 'Maintenance Team 2', aiSummary: 'Water pipe joint failure in ceiling above Restroom B4. Estimated flow rate indicates minor leak that could worsen.', aiRecommendation: 'Close Restroom B4 and redirect visitors to B3 and B5. Place wet floor signage. Schedule emergency plumbing repair for halftime.' },
  { id: 'INC-006', title: 'Lost Child Report', description: 'Parent reported 6-year-old child separated near Food Court A.', type: 'crowd', priority: 'high', status: 'in-progress', location: 'Food Court A', reportedAt: '2026-07-10T19:20:00Z', assignedTo: 'Volunteer Team 7', aiSummary: 'Child (female, 6 years, wearing Brazil jersey) last seen at Food Court A approximately 10 minutes ago. Parent was purchasing food when separation occurred.', aiRecommendation: 'Activate lost child protocol. Alert all security and volunteer teams with description. Check CCTV feeds for Food Court A area. Make PA announcement. Deploy volunteers to cover exits and family assistance points.' },
  { id: 'INC-007', title: 'VIP Access System Malfunction', description: 'VIP badge readers at North VIP entrance returning errors.', type: 'technical', priority: 'low', status: 'resolved', location: 'VIP North Entrance', reportedAt: '2026-07-10T17:15:00Z', resolvedAt: '2026-07-10T17:42:00Z', assignedTo: 'IT Support', aiSummary: 'Badge reader firmware glitch caused authentication failures. Resolved with system restart.', aiRecommendation: 'Monitor for recurrence. Schedule firmware update post-event.' },
  { id: 'INC-008', title: 'Fan Altercation Section 108', description: 'Verbal altercation between fan groups in Section 108 escalating.', type: 'security', priority: 'high', status: 'resolved', location: 'Section 108, Row 5-8', reportedAt: '2026-07-10T19:05:00Z', resolvedAt: '2026-07-10T19:18:00Z', assignedTo: 'Security Team Bravo', aiSummary: 'Verbal dispute between groups of opposing team supporters. No physical contact reported. Security intervened and separated groups.', aiRecommendation: 'Maintain security presence in Section 108. Consider relocating one group if tensions persist. Document incident for post-event review.' },
];

// ========================================
// Staff
// ========================================

export const staffMembers: StaffMember[] = [
  { id: 's1', name: 'Sarah Chen', role: 'Operations Manager', zone: 'Command Center', status: 'available', phone: '+1-555-0101' },
  { id: 's2', name: 'Marcus Johnson', role: 'Security Lead', zone: 'North Entrance', status: 'busy', phone: '+1-555-0102' },
  { id: 's3', name: 'Dr. Elena Martinez', role: 'Chief Medical Officer', zone: 'Medical Room 1', status: 'busy', phone: '+1-555-0103' },
  { id: 's4', name: 'James Wilson', role: 'Crowd Control', zone: 'Gate B1', status: 'busy', phone: '+1-555-0104' },
  { id: 's5', name: 'Aisha Patel', role: 'Volunteer Coordinator', zone: 'Fan Zone', status: 'available', phone: '+1-555-0105' },
  { id: 's6', name: 'Robert Kim', role: 'IT Systems', zone: 'Server Room', status: 'available', phone: '+1-555-0106' },
  { id: 's7', name: 'Maria Rodriguez', role: 'Food Services', zone: 'Concourse A', status: 'busy', phone: '+1-555-0107' },
  { id: 's8', name: 'David Tanaka', role: 'Security Officer', zone: 'VIP Section', status: 'available', phone: '+1-555-0108' },
  { id: 's9', name: 'Lisa Thompson', role: 'Paramedic', zone: 'Medical Room 2', status: 'break', phone: '+1-555-0109' },
  { id: 's10', name: 'Ahmed Hassan', role: 'Parking Manager', zone: 'Parking Control', status: 'available', phone: '+1-555-0110' },
  { id: 's11', name: 'Emily Brooks', role: 'Communications', zone: 'Command Center', status: 'available', phone: '+1-555-0111' },
  { id: 's12', name: 'Carlos Reyes', role: 'Maintenance Lead', zone: 'Level 2 East', status: 'busy', phone: '+1-555-0112' },
];

// ========================================
// Equipment
// ========================================

export const equipmentList: Equipment[] = [
  { id: 'eq1', name: 'CCTV System A', type: 'Surveillance', status: 'operational', location: 'North Stand', lastChecked: '2026-07-10T18:00:00Z', healthScore: 98 },
  { id: 'eq2', name: 'CCTV System B', type: 'Surveillance', status: 'operational', location: 'South Stand', lastChecked: '2026-07-10T18:00:00Z', healthScore: 96 },
  { id: 'eq3', name: 'PA System Main', type: 'Communications', status: 'operational', location: 'Stadium Wide', lastChecked: '2026-07-10T17:30:00Z', healthScore: 100 },
  { id: 'eq4', name: 'Scoreboard LED', type: 'Display', status: 'operational', location: 'North End', lastChecked: '2026-07-10T17:00:00Z', healthScore: 94 },
  { id: 'eq5', name: 'Generator Backup 1', type: 'Power', status: 'operational', location: 'Power Room A', lastChecked: '2026-07-10T16:00:00Z', healthScore: 92 },
  { id: 'eq6', name: 'Generator Backup 2', type: 'Power', status: 'warning', location: 'Power Room B', lastChecked: '2026-07-10T18:30:00Z', healthScore: 68 },
  { id: 'eq7', name: 'Turnstile Bank C', type: 'Access', status: 'warning', location: 'Gate C2', lastChecked: '2026-07-10T19:00:00Z', healthScore: 72 },
  { id: 'eq8', name: 'Fire Suppression', type: 'Safety', status: 'operational', location: 'All Zones', lastChecked: '2026-07-10T14:00:00Z', healthScore: 100 },
  { id: 'eq9', name: 'HVAC System West', type: 'Climate', status: 'operational', location: 'West Stand', lastChecked: '2026-07-10T16:00:00Z', healthScore: 88 },
  { id: 'eq10', name: 'WiFi Network', type: 'Network', status: 'warning', location: 'Stadium Wide', lastChecked: '2026-07-10T19:15:00Z', healthScore: 74 },
];

// ========================================
// Security Alerts
// ========================================

export const securityAlerts: SecurityAlert[] = [
  { id: 'sa1', type: 'suspicious-activity', severity: 'high', location: 'Parking Lot P3', description: 'Unauthorized drone operator identified in parking lot P3', timestamp: '2026-07-10T19:08:00Z', status: 'investigating', aiAssessment: 'High risk — drone could carry recording equipment or pose physical danger. Counter-drone team deployed.' },
  { id: 'sa2', type: 'unauthorized-access', severity: 'medium', location: 'VIP Lounge North', description: 'Fan attempted to access VIP area with counterfeit credential', timestamp: '2026-07-10T18:55:00Z', status: 'resolved', aiAssessment: 'Low ongoing risk. Credential was poor quality forgery. Individual escorted to correct seating.' },
  { id: 'sa3', type: 'bag-screening', severity: 'low', location: 'Gate A1', description: 'Prohibited item (glass bottle) detected in bag screening', timestamp: '2026-07-10T18:20:00Z', status: 'resolved', aiAssessment: 'No threat. Standard prohibited item confiscation. Fan complied willingly.' },
  { id: 'sa4', type: 'cctv', severity: 'medium', location: 'Concourse B', description: 'CCTV detected individual moving against crowd flow repeatedly', timestamp: '2026-07-10T19:22:00Z', status: 'active', aiAssessment: 'Moderate risk. Behavior pattern unusual but may be lost fan. Deploy volunteer to make contact and offer assistance.' },
  { id: 'sa5', type: 'perimeter', severity: 'low', location: 'East Perimeter', description: 'Perimeter sensor triggered near service entrance', timestamp: '2026-07-10T18:05:00Z', status: 'resolved', aiAssessment: 'False alarm. Triggered by delivery vehicle. No breach detected.' },
  { id: 'sa6', type: 'suspicious-activity', severity: 'high', location: 'Section 108', description: 'Group confrontation escalating between rival fan groups', timestamp: '2026-07-10T19:05:00Z', status: 'resolved', aiAssessment: 'Situation resolved by Security Team Bravo. Groups separated. Ongoing monitoring recommended.' },
];

export const threatLevel: ThreatLevel = {
  overall: 'moderate',
  score: 34,
  factors: ['Active drone incident', 'Crowd density at 82%', 'One unresolved suspicious behavior alert', 'Weather conditions favorable'],
  lastUpdated: '2026-07-10T19:30:00Z',
};

// ========================================
// Medical Cases
// ========================================

export const medicalCases: MedicalCase[] = [
  { id: 'MC-001', type: 'heat-stroke', severity: 'severe', location: 'Section 214, Row 12', patientAge: 55, patientGender: 'Male', description: 'Fan collapsed, suspected heat stroke. Conscious but disoriented.', status: 'treating', reportedAt: '2026-07-10T19:25:00Z', assignedMedic: 'Dr. Martinez', responseTime: 3 },
  { id: 'MC-002', type: 'fracture', severity: 'moderate', location: 'Concourse A Stairs', patientAge: 34, patientGender: 'Female', description: 'Fan fell on stairs, suspected ankle fracture.', status: 'stabilized', reportedAt: '2026-07-10T18:50:00Z', assignedMedic: 'Paramedic Jones', responseTime: 5 },
  { id: 'MC-003', type: 'allergic', severity: 'severe', location: 'Food Court B', patientAge: 12, patientGender: 'Male', description: 'Child experiencing allergic reaction to food. EpiPen administered.', status: 'transported', reportedAt: '2026-07-10T19:10:00Z', assignedMedic: 'Dr. Patel', responseTime: 2 },
  { id: 'MC-004', type: 'fainting', severity: 'minor', location: 'Section 102', patientAge: 28, patientGender: 'Female', description: 'Fan fainted, recovered quickly. Likely dehydration.', status: 'released', reportedAt: '2026-07-10T18:30:00Z', assignedMedic: 'Nurse Williams', responseTime: 4 },
  { id: 'MC-005', type: 'cardiac', severity: 'critical', location: 'VIP Lounge South', patientAge: 68, patientGender: 'Male', description: 'Chest pain and shortness of breath. AED on standby.', status: 'treating', reportedAt: '2026-07-10T19:28:00Z', assignedMedic: 'Dr. Chen', responseTime: 2 },
  { id: 'MC-006', type: 'intoxication', severity: 'minor', location: 'Gate D1 Area', patientAge: 24, patientGender: 'Male', description: 'Intoxicated fan, unable to walk steadily. No injury.', status: 'waiting', reportedAt: '2026-07-10T19:15:00Z', responseTime: 8 },
  { id: 'MC-007', type: 'other', severity: 'minor', location: 'Section 310', patientAge: 42, patientGender: 'Female', description: 'Panic attack, hyperventilating. Being calmed by volunteers.', status: 'treating', reportedAt: '2026-07-10T19:22:00Z', assignedMedic: 'Nurse Park', responseTime: 6 },
];

export const ambulances: Ambulance[] = [
  { id: 'amb1', callSign: 'Medic-1', status: 'on-scene', location: 'Section 214', currentCase: 'MC-001' },
  { id: 'amb2', callSign: 'Medic-2', status: 'transporting', location: 'En route to Hospital', currentCase: 'MC-003', eta: 8 },
  { id: 'amb3', callSign: 'Medic-3', status: 'available', location: 'Medical Bay South' },
  { id: 'amb4', callSign: 'Medic-4', status: 'on-scene', location: 'VIP Lounge South', currentCase: 'MC-005' },
  { id: 'amb5', callSign: 'Medic-5', status: 'available', location: 'Medical Bay North' },
];

// ========================================
// Parking
// ========================================

export const parkingLots: ParkingLot[] = [
  { id: 'p1', name: 'Lot A - North', totalSpaces: 3200, occupiedSpaces: 3100, evChargers: 40, evChargersAvailable: 5, walkingTime: 8, status: 'open', trafficLevel: 'moderate' },
  { id: 'p2', name: 'Lot B - East', totalSpaces: 2800, occupiedSpaces: 2800, evChargers: 30, evChargersAvailable: 0, walkingTime: 12, status: 'full', trafficLevel: 'heavy' },
  { id: 'p3', name: 'Lot C - South', totalSpaces: 3500, occupiedSpaces: 3200, evChargers: 50, evChargersAvailable: 8, walkingTime: 10, status: 'open', trafficLevel: 'moderate' },
  { id: 'p4', name: 'Lot D - West', totalSpaces: 2500, occupiedSpaces: 2100, evChargers: 25, evChargersAvailable: 12, walkingTime: 6, status: 'open', trafficLevel: 'low' },
  { id: 'p5', name: 'VIP Parking', totalSpaces: 500, occupiedSpaces: 420, evChargers: 20, evChargersAvailable: 4, walkingTime: 3, status: 'open', trafficLevel: 'low' },
  { id: 'p6', name: 'Overflow Lot F', totalSpaces: 4000, occupiedSpaces: 1800, evChargers: 15, evChargersAvailable: 15, walkingTime: 18, status: 'open', trafficLevel: 'low' },
];

// ========================================
// Food & Vendors
// ========================================

export const foodVendors: FoodVendor[] = [
  { id: 'fv1', name: 'Stadium Burger Co.', type: 'fast-food', location: 'Concourse A', queueLength: 45, avgWaitTime: 14, status: 'busy', revenue: 28400, popularItems: [{ name: 'Classic Burger', price: 12, sold: 890, inStock: 110 }, { name: 'Loaded Fries', price: 8, sold: 1200, inStock: 300 }, { name: 'Hot Dog', price: 7, sold: 650, inStock: 350 }], inventoryStatus: 'low' },
  { id: 'fv2', name: 'Pizza Palace', type: 'fast-food', location: 'Concourse B', queueLength: 32, avgWaitTime: 11, status: 'open', revenue: 22100, popularItems: [{ name: 'Margherita Pizza', price: 14, sold: 620, inStock: 380 }, { name: 'Pepperoni Slice', price: 6, sold: 1400, inStock: 600 }], inventoryStatus: 'stocked' },
  { id: 'fv3', name: 'Taco Fiesta', type: 'fast-food', location: 'Concourse A', queueLength: 28, avgWaitTime: 9, status: 'open', revenue: 18500, popularItems: [{ name: 'Beef Tacos (3)', price: 11, sold: 780, inStock: 220 }, { name: 'Nachos Grande', price: 10, sold: 540, inStock: 460 }], inventoryStatus: 'stocked' },
  { id: 'fv4', name: 'Refreshment Hub', type: 'beverages', location: 'All Concourses', queueLength: 55, avgWaitTime: 8, status: 'busy', revenue: 45200, popularItems: [{ name: 'Draft Beer', price: 10, sold: 3200, inStock: 800 }, { name: 'Soft Drink', price: 5, sold: 2800, inStock: 1200 }, { name: 'Water Bottle', price: 4, sold: 4100, inStock: 900 }], inventoryStatus: 'low' },
  { id: 'fv5', name: 'Green Bowl', type: 'vegan', location: 'Concourse C', queueLength: 12, avgWaitTime: 7, status: 'open', revenue: 8900, popularItems: [{ name: 'Buddha Bowl', price: 15, sold: 280, inStock: 120 }, { name: 'Smoothie', price: 8, sold: 420, inStock: 180 }], inventoryStatus: 'stocked' },
  { id: 'fv6', name: 'Premium Lounge Bar', type: 'premium', location: 'VIP Level', queueLength: 8, avgWaitTime: 5, status: 'open', revenue: 34600, popularItems: [{ name: 'Cocktail Selection', price: 18, sold: 680, inStock: 320 }, { name: 'Charcuterie Board', price: 25, sold: 240, inStock: 60 }], inventoryStatus: 'stocked' },
];

// ========================================
// Announcements
// ========================================

export const announcements: Announcement[] = [
  { id: 'ann1', title: 'Gate B1 Congestion Advisory', message: 'Heavy congestion near Gate B1. Please use Gates A2 or C1 for faster entry. Estimated wait at B1: 18 minutes.', type: 'warning', language: 'en', translations: { es: 'Congestión intensa cerca de la Puerta B1. Por favor use las Puertas A2 o C1 para una entrada más rápida.', fr: 'Forte congestion près de la Porte B1. Veuillez utiliser les Portes A2 ou C1 pour une entrée plus rapide.' }, createdAt: '2026-07-10T19:12:00Z', publishedAt: '2026-07-10T19:13:00Z', status: 'published', generatedByAI: true },
  { id: 'ann2', title: 'Parking Lot B Full', message: 'Parking Lot B (East) is now full. Available parking at Lot D (West) with 400 spaces and Overflow Lot F with 2,200 spaces.', type: 'info', language: 'en', createdAt: '2026-07-10T18:45:00Z', publishedAt: '2026-07-10T18:46:00Z', status: 'published', generatedByAI: true },
  { id: 'ann3', title: 'Weather Advisory', message: 'Current temperature is 28°C with UV Index 6. Stay hydrated! Free water stations available at all concourse intersections.', type: 'info', language: 'en', createdAt: '2026-07-10T17:00:00Z', publishedAt: '2026-07-10T17:01:00Z', status: 'published', generatedByAI: false },
  { id: 'ann4', title: 'Half-Time Entertainment', message: 'Half-time entertainment begins in 5 minutes featuring a special musical performance. Please return to your seats.', type: 'general', language: 'en', createdAt: '2026-07-10T19:40:00Z', status: 'draft', generatedByAI: false },
];

// ========================================
// Notifications
// ========================================

export const notifications: AppNotification[] = [
  { id: 'n1', title: 'Critical: Medical Emergency', message: 'Cardiac event reported in VIP Lounge South. Response team dispatched.', type: 'error', read: false, timestamp: '2026-07-10T19:28:00Z', module: 'medical', link: '/dashboard/medical' },
  { id: 'n2', title: 'High: Crowd Surge Detected', message: 'Crowd density at Gate B1 exceeds 95%. Immediate action required.', type: 'warning', read: false, timestamp: '2026-07-10T19:12:00Z', module: 'crowd', link: '/dashboard/crowd' },
  { id: 'n3', title: 'Drone Detected', message: 'Unauthorized drone detected over South Stand. Counter-measures activated.', type: 'warning', read: false, timestamp: '2026-07-10T19:08:00Z', module: 'security', link: '/dashboard/security' },
  { id: 'n4', title: 'Parking Lot B Full', message: 'Lot B has reached maximum capacity. Traffic redirected to Lot D and F.', type: 'info', read: true, timestamp: '2026-07-10T18:45:00Z', module: 'parking', link: '/dashboard/parking' },
  { id: 'n5', title: 'AI Risk Score Updated', message: 'Overall risk score decreased from 39 to 34. Three incidents resolved.', type: 'success', read: true, timestamp: '2026-07-10T19:30:00Z', module: 'dashboard' },
  { id: 'n6', title: 'Equipment Warning', message: 'WiFi Network health score dropped to 74%. Bandwidth congestion detected.', type: 'warning', read: true, timestamp: '2026-07-10T19:15:00Z', module: 'operations', link: '/dashboard/operations' },
];

// ========================================
// AI Insights
// ========================================

export const aiInsights: AIInsight[] = [
  { id: 'ai1', type: 'recommendation', title: 'Open Auxiliary Lane at Gate B1', content: 'Based on current throughput data and predicted arrivals, Gate B1 will remain congested for the next 15 minutes. Opening the auxiliary lane and deploying 3 additional staff members will reduce average wait time by approximately 40%.', confidence: 92, priority: 'high', category: 'Crowd Management', createdAt: '2026-07-10T19:12:00Z', actionable: true, actions: [{ id: 'a1', label: 'Open Auxiliary Lane', type: 'primary', action: 'open-aux-lane-b1' }, { id: 'a2', label: 'Deploy Staff', type: 'secondary', action: 'deploy-staff-b1' }] },
  { id: 'ai2', type: 'prediction', title: 'Post-Match Exit Congestion', content: 'Based on historical patterns and current attendance of 67,842, peak exit congestion is predicted at Gates D1 and B1 between T+5 and T+25 minutes after match end. Recommended: Pre-position crowd management teams and activate all exit gates 10 minutes before final whistle.', confidence: 88, priority: 'high', category: 'Predictive Analytics', createdAt: '2026-07-10T19:25:00Z', actionable: true, actions: [{ id: 'a3', label: 'Activate Exit Protocol', type: 'primary', action: 'activate-exit-protocol' }] },
  { id: 'ai3', type: 'alert', title: 'Beverage Inventory Running Low', content: 'Water bottles and draft beer stock levels are below 25% threshold at Refreshment Hub. Current consumption rate suggests stockout in approximately 45 minutes. Recommend immediate restocking from warehouse reserves.', confidence: 95, priority: 'medium', category: 'Food & Beverage', createdAt: '2026-07-10T19:20:00Z', actionable: true, actions: [{ id: 'a4', label: 'Trigger Restock', type: 'primary', action: 'restock-beverages' }] },
  { id: 'ai4', type: 'summary', title: 'Second Half Operations Summary', content: 'The second half has seen 3 new incidents (1 medical critical, 1 crowd management, 1 security). Overall operations are within normal parameters. Risk score has decreased from 39 to 34 due to resolution of VIP access and fan altercation incidents. Key concern: Medical staffing may be stretched if additional heat-related cases arise.', confidence: 90, priority: 'medium', category: 'Executive Summary', createdAt: '2026-07-10T19:30:00Z', actionable: false },
];

// ========================================
// Analytics Data
// ========================================

export const revenueByVendor: ChartDataPoint[] = [
  { name: 'Refreshment Hub', value: 45200, color: '#3B82F6' },
  { name: 'Premium Lounge', value: 34600, color: '#D4AF37' },
  { name: 'Stadium Burger', value: 28400, color: '#10B981' },
  { name: 'Pizza Palace', value: 22100, color: '#F59E0B' },
  { name: 'Taco Fiesta', value: 18500, color: '#EC4899' },
  { name: 'Green Bowl', value: 8900, color: '#8B5CF6' },
];

export const incidentsByType: ChartDataPoint[] = [
  { name: 'Crowd', value: 2, color: '#3B82F6' },
  { name: 'Security', value: 2, color: '#EF4444' },
  { name: 'Medical', value: 1, color: '#F59E0B' },
  { name: 'Technical', value: 2, color: '#8B5CF6' },
  { name: 'Maintenance', value: 1, color: '#06B6D4' },
];

export const hourlyAttendance: ChartDataPoint[] = [
  { name: '2PM', value: 8200, projected: 8000 },
  { name: '3PM', value: 24600, projected: 25000 },
  { name: '4PM', value: 41500, projected: 40000 },
  { name: '5PM', value: 54200, projected: 55000 },
  { name: '6PM', value: 62400, projected: 63000 },
  { name: '7PM', value: 67842, projected: 70000 },
  { name: '8PM', value: 67842, projected: 75000 },
];

export const gateUtilization: ChartDataPoint[] = gateStatuses
  .filter(g => g.status !== 'closed')
  .map(g => ({
    name: g.name,
    value: Math.round((g.throughput / g.maxCapacity) * 100),
    throughput: g.throughput,
    capacity: g.maxCapacity,
  }));

// ========================================
// Activity Feed
// ========================================

export interface ActivityItem {
  id: string;
  type: 'incident' | 'alert' | 'system' | 'ai' | 'resolution';
  message: string;
  timestamp: string;
  icon: string;
  color: string;
}

export const activityFeed: ActivityItem[] = [
  { id: 'af1', type: 'ai', message: 'AI Risk Score updated: 34/100 (Low-Moderate)', timestamp: '2026-07-10T19:30:00Z', icon: 'Brain', color: '#10B981' },
  { id: 'af2', type: 'incident', message: 'Critical: Cardiac event — VIP Lounge South', timestamp: '2026-07-10T19:28:00Z', icon: 'Heart', color: '#EF4444' },
  { id: 'af3', type: 'incident', message: 'Medical: Heat stroke case — Section 214', timestamp: '2026-07-10T19:25:00Z', icon: 'Thermometer', color: '#F59E0B' },
  { id: 'af4', type: 'alert', message: 'CCTV: Unusual movement pattern — Concourse B', timestamp: '2026-07-10T19:22:00Z', icon: 'Camera', color: '#8B5CF6' },
  { id: 'af5', type: 'incident', message: 'Lost child report — Food Court A', timestamp: '2026-07-10T19:20:00Z', icon: 'AlertTriangle', color: '#F59E0B' },
  { id: 'af6', type: 'ai', message: 'AI: Beverage restock recommended within 45 min', timestamp: '2026-07-10T19:20:00Z', icon: 'Brain', color: '#3B82F6' },
  { id: 'af7', type: 'resolution', message: 'Resolved: Fan altercation — Section 108', timestamp: '2026-07-10T19:18:00Z', icon: 'CheckCircle', color: '#10B981' },
  { id: 'af8', type: 'alert', message: 'WiFi network health dropped to 74%', timestamp: '2026-07-10T19:15:00Z', icon: 'Wifi', color: '#F59E0B' },
  { id: 'af9', type: 'incident', message: 'Crowd surge detected at Gate B1', timestamp: '2026-07-10T19:12:00Z', icon: 'Users', color: '#EF4444' },
  { id: 'af10', type: 'ai', message: 'AI: Open auxiliary lane at Gate B1 recommended', timestamp: '2026-07-10T19:12:00Z', icon: 'Brain', color: '#3B82F6' },
  { id: 'af11', type: 'incident', message: 'Unauthorized drone detected — South Stand', timestamp: '2026-07-10T19:08:00Z', icon: 'AlertTriangle', color: '#EF4444' },
  { id: 'af12', type: 'resolution', message: 'Resolved: Fan altercation in Section 108', timestamp: '2026-07-10T19:05:00Z', icon: 'CheckCircle', color: '#10B981' },
];
