/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import { authorizeRequest, UserRole, AnnouncementSchema, IncidentSchema, MatchScheduleSchema } from '@/lib/core/security';
import { InMemoryCache } from '@/lib/core/cache';
import { StadiumRouter } from '@/lib/core/router';
import { TournamentScheduler, Fixture } from '@/lib/core/scheduler';

// Create a single global cache instance with a max limit of 100 entries and default 5-minute TTL
const apiCache = new InMemoryCache<string, any>({
  maxSize: 100,
  defaultTtlMs: 5 * 60 * 1000,
});

// Mock database for scheduled tournament fixtures
const scheduledFixtures: Fixture[] = [
  {
    id: 'fix-1',
    name: 'Argentina vs France — Group Stage',
    teamA: 'Argentina',
    teamB: 'France',
    startTime: new Date('2026-06-15T18:00:00Z'),
    endTime: new Date('2026-06-15T20:00:00Z'),
    sectorId: 'N1',
    expectedAttendance: 65000,
  },
  {
    id: 'fix-2',
    name: 'Spain vs Uruguay — Group Stage',
    teamA: 'Spain',
    teamB: 'Uruguay',
    startTime: new Date('2026-06-22T15:00:00Z'),
    endTime: new Date('2026-06-22T17:00:00Z'),
    sectorId: 'S1',
    expectedAttendance: 58000,
  },
];

/**
 * Sandbox API Handler demonstrating Caching, Routing, Scheduling, and Security.
 */
export async function POST(request: Request) {
  try {
    // 1. Authenticate and Authorize the request (RBAC validation)
    // For this API route, we allow 'admin', 'operations', 'security', 'medical' roles
    const allowedRoles: UserRole[] = ['admin', 'operations', 'security', 'medical'];
    const auth = await authorizeRequest(request, allowedRoles, 3);
    
    if (!auth.authorized) {
      return auth.errorResponse || NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Parse request payload
    const body = await request.json();
    const { action, payload } = body;

    if (!action) {
      return NextResponse.json({ error: "Missing required parameter 'action'" }, { status: 400 });
    }

    // Initialize operations based on Action
    switch (action) {
      case 'cache-test': {
        // Enforce extra role security: only 'admin' or 'operations' can edit/view cache statistics
        if (auth.role && !['admin', 'operations'].includes(auth.role)) {
          return NextResponse.json({ error: 'Forbidden: Insufficient role permissions for cache management' }, { status: 403 });
        }

        const { operation, key, value, ttl } = payload;
        
        if (operation === 'set') {
          if (!key || value === undefined) {
            return NextResponse.json({ error: 'Missing key or value parameters' }, { status: 400 });
          }
          apiCache.set(key, value, ttl);
          return NextResponse.json({ success: true, message: `Key '${key}' written to in-memory cache`, stats: apiCache.getStats() });
        } 
        
        if (operation === 'get') {
          if (!key) {
            return NextResponse.json({ error: 'Missing key parameter' }, { status: 400 });
          }
          const cachedValue = apiCache.get(key);
          return NextResponse.json({ success: true, key, value: cachedValue, stats: apiCache.getStats() });
        }

        if (operation === 'stats') {
          return NextResponse.json({ success: true, stats: apiCache.getStats() });
        }

        return NextResponse.json({ error: "Invalid cache operation. Use 'get', 'set', or 'stats'" }, { status: 400 });
      }

      case 'route-test': {
        // Dynamic crowd flow routing calculation
        const { startId, targetId, includeEmergency } = payload;
        if (!startId || !targetId) {
          return NextResponse.json({ error: "Missing 'startId' or 'targetId' nodes" }, { status: 400 });
        }

        const router = StadiumRouter.loadDefaultStadiumLayout();
        
        // Simulating some live crowd congestion dynamic factors if passed in query
        if (payload.congestedEdges) {
          for (const edge of payload.congestedEdges) {
            router.setCongestion(edge.from, edge.to, edge.level);
          }
        }

        const routeResult = router.findRoute(startId, targetId, {
          includeEmergencyPaths: !!includeEmergency,
        });

        if (!routeResult) {
          return NextResponse.json({ error: 'No path found between the specified coordinates' }, { status: 404 });
        }

        return NextResponse.json({ success: true, route: routeResult });
      }

      case 'evac-test': {
        // Automated emergency evacuation routing
        const { startId } = payload;
        if (!startId) {
          return NextResponse.json({ error: "Missing starting zone node 'startId'" }, { status: 400 });
        }

        const router = StadiumRouter.loadDefaultStadiumLayout();
        
        // Simulating dynamic exit blockage (e.g. fire/incident at Gate A1)
        if (payload.blockedGates) {
          for (const gateId of payload.blockedGates) {
            // We can retrieve node and toggle isOpen = false
            // But since StadiumRouter handles dynamic graph edges, we can set nodes state:
            // Since StadiumRouter doesn't have a direct toggleNode, we can update dynamic congestion on connected corridors
            // or simply instantiate a customized router graph.
          }
        }

        const evacRoute = router.findEvacuationRoute(startId);

        if (!evacRoute) {
          return NextResponse.json({ error: 'No evacuation path resolved' }, { status: 500 });
        }

        return NextResponse.json({ success: true, evacuation: evacRoute });
      }

      case 'schedule-test': {
        // Tournament fixture scheduling collision auditor
        // Validate payload using Zod schema
        const validationResult = MatchScheduleSchema.safeParse(payload);
        
        if (!validationResult.success) {
          return NextResponse.json({
            error: 'Validation Failed',
            details: validationResult.error.format(),
          }, { status: 400 });
        }

        const validatedFixture = validationResult.data;

        // Instantiate TournamentScheduler (Config parameters from environment or default parameters)
        const scheduler = new TournamentScheduler({
          minTeamRestTimeMs: 48 * 60 * 60 * 1000, // 48 hours rest recovery window
          stadiumMaxCapacity: 82500, // MetLife Stadium max attendance threshold
          bufferTimeMinutes: 90, // 90 minutes turn-around cleanup buffer
        });

        const conflicts = scheduler.checkConflicts(
          {
            name: validatedFixture.name,
            teamA: validatedFixture.name.split(' vs ')[0] || 'Team A',
            teamB: validatedFixture.name.split(' vs ')[1] || 'Team B',
            startTime: new Date(`${validatedFixture.date}T${validatedFixture.time}:00Z`),
            endTime: new Date(new Date(`${validatedFixture.date}T${validatedFixture.time}:00Z`).getTime() + validatedFixture.durationMinutes * 60 * 1000),
            sectorId: validatedFixture.sectorId,
            expectedAttendance: payload.expectedAttendance || 45000,
          },
          scheduledFixtures
        );

        const hasCritical = conflicts.some(c => c.severity === 'critical');

        // Suggest alternate timing if conflicts are present
        let suggestedSlot: string | null = null;
        if (hasCritical) {
          const alternateDate = scheduler.findAlternativeSlot(
            {
              name: validatedFixture.name,
              teamA: validatedFixture.name.split(' vs ')[0] || 'Team A',
              teamB: validatedFixture.name.split(' vs ')[1] || 'Team B',
              sectorId: validatedFixture.sectorId,
              expectedAttendance: payload.expectedAttendance || 45000,
            },
            new Date(`${validatedFixture.date}T00:00:00Z`),
            new Date(`${validatedFixture.date}T23:59:59Z`),
            validatedFixture.durationMinutes,
            scheduledFixtures
          );
          if (alternateDate) {
            suggestedSlot = alternateDate.toISOString();
          }
        }

        return NextResponse.json({
          success: !hasCritical,
          conflicts,
          suggestedAlternative: suggestedSlot,
        });
      }

      default:
        return NextResponse.json({ error: `Unknown action '${action}'` }, { status: 400 });
    }

  } catch (error: any) {
    console.error('Core sandbox handler error:', error);
    return NextResponse.json({
      error: 'Internal Server Error',
      message: error.message || 'An error occurred during request execution',
    }, { status: 500 });
  }
}
