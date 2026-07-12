/* eslint-disable @typescript-eslint/no-explicit-any */
import { GET as getAnnouncements, POST as postAnnouncement } from '../app/api/announcements/route';
import { GET as getIncidents, POST as postIncident } from '../app/api/incidents/route';
import { POST as runSandbox } from '../app/api/core-demo/route';
import fs from 'fs';

// Mock the file system database writes
jest.mock('fs');
const mockedFs = fs as jest.Mocked<typeof fs>;

describe('API Routes Integration & Authorization Guard Checks', () => {
  let mockDb: any;

  beforeEach(() => {
    mockDb = {
      announcements: [
        { id: 'ann-1', title: 'Welcome', message: 'Hello World', type: 'info', createdAt: '2026-07-10T12:00:00Z', status: 'published', generatedByAI: false }
      ],
      incidents: [
        { id: 'INC-1', title: 'Main Leak', description: 'Restroom leak', type: 'maintenance', priority: 'medium', status: 'open', location: 'Restroom B4', reportedAt: '2026-07-10T12:00:00Z' }
      ]
    };

    mockedFs.readFileSync.mockReturnValue(JSON.stringify(mockDb));
    mockedFs.writeFileSync.mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Announcements Endpoint (/api/announcements)', () => {
    it('should return all announcements and hit/miss cache logs on GET', async () => {
      const response1 = await getAnnouncements();
      expect(response1.status).toBe(200);
      const data1 = await response1.json();
      expect(data1.length).toBe(1);
      expect(response1.headers.get('X-Cache')).toBe('MISS');

      // Second load should check cache HIT
      const response2 = await getAnnouncements();
      expect(response2.headers.get('X-Cache')).toBe('HIT');
    });

    it('should create a new announcement when called by operations role', async () => {
      const req = new Request('http://localhost/api/announcements', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-user-role': 'operations',
        },
        body: JSON.stringify({
          title: 'Gate Surge alert',
          message: 'Redirecting attendees to auxiliary lanes',
          type: 'warning',
          language: 'en'
        }),
      });

      const response = await postAnnouncement(req);
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.id).toBeDefined();
      expect(data.title).toBe('Gate Surge alert');
      expect(mockedFs.writeFileSync).toHaveBeenCalled();
    });

    it('should fail with 400 on invalid announcement input structures', async () => {
      const req = new Request('http://localhost/api/announcements', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-user-role': 'operations',
        },
        body: JSON.stringify({
          title: 'Hi', // too short (min 3)
          message: 'Short',
          type: 'invalid-type'
        }),
      });

      const response = await postAnnouncement(req);
      expect(response.status).toBe(400);
      const err = await response.json();
      expect(err.error).toBe('Validation Failed');
    });

    it('should block attendee/fan role from posting announcements', async () => {
      const req = new Request('http://localhost/api/announcements', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-user-role': 'fan', // fan has insufficient rank (1) vs operations (4)
        },
        body: JSON.stringify({
          title: 'Test Title',
          message: 'Valid Message body content',
          type: 'info'
        }),
      });

      const response = await postAnnouncement(req);
      expect(response.status).toBe(403);
    });
  });

  describe('Incidents Endpoint (/api/incidents)', () => {
    it('should create a new incident when reported by security personnel', async () => {
      const req = new Request('http://localhost/api/incidents', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-user-role': 'security', // rank 3 is allowed
        },
        body: JSON.stringify({
          title: 'Unauthorized drone',
          description: 'Spotted above South stand VIP deck',
          type: 'security',
          priority: 'high',
          location: 'South Airspace'
        }),
      });

      const response = await postIncident(req);
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.title).toBe('Unauthorized drone');
    });
  });

  describe('Core Operations sandbox (/api/core-demo)', () => {
    it('should calculate Dijkstra route between stadium nodes in sandbox', async () => {
      const req = new Request('http://localhost/api/core-demo', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-user-role': 'admin',
        },
        body: JSON.stringify({
          action: 'route-test',
          payload: {
            startId: 'N2',
            targetId: 'gate3'
          }
        }),
      });

      const response = await runSandbox(req);
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.route.totalDistanceMeters).toBeGreaterThan(0);
    });

    it('should audit fixture timing collisions in scheduler sandbox', async () => {
      const req = new Request('http://localhost/api/core-demo', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-user-role': 'operations',
        },
        body: JSON.stringify({
          action: 'schedule-test',
          payload: {
            name: 'Argentina vs France', // team collision check
            date: '2026-06-15',
            time: '19:00', // overlaps with existing: fix-1 (18:00 - 20:00)
            durationMinutes: 120,
            sectorId: 'N1',
            expectedAttendance: 60000
          }
        }),
      });

      const response = await runSandbox(req);
      expect(response.status).toBe(200);
      const data = await response.json();
      // Should fail due to direct scheduling conflict
      expect(data.success).toBe(false);
      expect(data.conflicts.length).toBeGreaterThan(0);
      expect(data.suggestedAlternative).toBeDefined(); // should return alternate timings suggestion
    });
  });
});
