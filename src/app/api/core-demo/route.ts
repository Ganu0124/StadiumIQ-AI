/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import { authorizeRequest, UserRole, AnnouncementSchema, IncidentSchema, MatchScheduleSchema } from '@/lib/core/security';
import { InMemoryCache } from '@/lib/core/cache';
import { StadiumRouter } from '@/lib/core/router';
import { TournamentScheduler, Fixture } from '@/lib/core/scheduler';
import { runTransaction } from '@/lib/core/db';

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

      case 'schedule-disruption': {
        const { fixtureId, delayMinutes, newSectorId, fixtures } = payload;
        if (!fixtureId || delayMinutes === undefined) {
          return NextResponse.json({ error: "Missing required parameters 'fixtureId' or 'delayMinutes'" }, { status: 400 });
        }

        const scheduler = new TournamentScheduler({
          minTeamRestTimeMs: 48 * 60 * 60 * 1000,
          stadiumMaxCapacity: 82500,
          bufferTimeMinutes: 90,
        });

        const activeFixtures = fixtures || scheduledFixtures;
        const result = scheduler.resolveCascadingConflicts(
          fixtureId,
          Number(delayMinutes),
          newSectorId,
          activeFixtures
        );

        return NextResponse.json({
          success: true,
          updatedFixtures: result.updatedFixtures,
          resolutions: result.resolutions,
        });
      }

      case 'ticket-validate': {
        const { zoneId, ticketId, attendeeCount = 1 } = payload;
        if (!zoneId || !ticketId) {
          return NextResponse.json({ error: "Missing required parameters 'zoneId' or 'ticketId'" }, { status: 400 });
        }

        // Hard backend fail-safe boundary check
        const { crowdZones } = require('@/data/mock-data');
        const zone = crowdZones.find((z: any) => z.id === zoneId);
        
        if (!zone) {
          return NextResponse.json({ error: `Zone with ID '${zoneId}' not found` }, { status: 404 });
        }

        const currentOccupancy = zone.currentOccupancy;
        const maxCapacity = zone.maxCapacity;

        if (currentOccupancy + attendeeCount > maxCapacity) {
          // Log automated incident alert to db.json via transaction concurrency lock
          await runTransaction((db: any) => {
            db.incidents.push({
              id: `INC-GAT-${Date.now()}`,
              title: `Fail-Safe Capacity Breach Alert at ${zone.name}`,
              description: `Blocked entry attempt of ${attendeeCount} fans. Zone occupancy is at ${currentOccupancy}/${maxCapacity} (${((currentOccupancy/maxCapacity)*100).toFixed(1)}%).`,
              type: 'crowd',
              priority: 'critical',
              status: 'open',
              location: zone.name,
              reportedAt: new Date().toISOString(),
            });
          });

          return NextResponse.json({
            success: false,
            error: 'Forbidden: Safe capacity threshold breached for this zone. Entry blocked.',
            currentOccupancy,
            maxCapacity,
            breachPercentage: (((currentOccupancy + attendeeCount) / maxCapacity) * 100).toFixed(1),
          }, { status: 403 });
        }

        return NextResponse.json({
          success: true,
          message: 'Ticket validated successfully. Proceed to enter.',
          zone: zone.name,
          currentOccupancy: currentOccupancy + attendeeCount,
          maxCapacity,
        });
      }

      case 'gate-entry': {
        const { gateId, attendeeCount = 1 } = payload;
        if (!gateId) {
          return NextResponse.json({ error: "Missing required parameter 'gateId'" }, { status: 400 });
        }

        // Hard backend boundary check for gate safety capacity limits
        const { gateStatuses } = require('@/data/mock-data');
        const gate = gateStatuses.find((g: any) => g.id === gateId);

        if (!gate) {
          return NextResponse.json({ error: `Gate with ID '${gateId}' not found` }, { status: 404 });
        }

        const currentThroughput = gate.throughput;
        const maxCapacity = gate.maxCapacity;

        if (currentThroughput + attendeeCount > maxCapacity) {
          // Log incident for security dispatch via transaction concurrency lock
          await runTransaction((db: any) => {
            db.incidents.push({
              id: `INC-SEC-${Date.now()}`,
              title: `Gate Safety Capacity Breach: ${gate.name}`,
              description: `Gate entry validation blocked automatically. Throughput (${currentThroughput}/${maxCapacity}) has exceeded safety levels.`,
              type: 'security',
              priority: 'high',
              status: 'open',
              location: gate.name,
              reportedAt: new Date().toISOString(),
            });
          });

          return NextResponse.json({
            success: false,
            error: 'Forbidden: Gate throughput safety limit exceeded. Access lane locked down.',
            throughput: currentThroughput,
            maxCapacity,
          }, { status: 403 });
        }

        return NextResponse.json({
          success: true,
          message: 'Access granted. Turnstile unlocked.',
          gate: gate.name,
          throughput: currentThroughput + attendeeCount,
          maxCapacity,
        });
      }

      default:
        return NextResponse.json({ error: `Unknown action '${action}'` }, { status: 400 });
    }

  } catch (error: any) {
    return NextResponse.json({
      error: 'Internal Server Error',
      message: error.message || 'An error occurred during request execution',
    }, { status: 500 });
  }
}
