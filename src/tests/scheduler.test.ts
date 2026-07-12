import { TournamentScheduler, Fixture } from '../lib/core/scheduler';

describe('TournamentScheduler (Collision & Conflict Auditor)', () => {
  let scheduler: TournamentScheduler;
  let existingFixtures: Fixture[];

  beforeEach(() => {
    scheduler = new TournamentScheduler({
      minTeamRestTimeMs: 48 * 60 * 60 * 1000, // 48 hours recovery window
      stadiumMaxCapacity: 82500, // MetLife capacity
      bufferTimeMinutes: 60, // 1 hour turnaround buffer
    });

    existingFixtures = [
      {
        id: 'fix-1',
        name: 'Argentina vs France',
        teamA: 'Argentina',
        teamB: 'France',
        startTime: new Date('2026-07-10T18:00:00Z'),
        endTime: new Date('2026-07-10T20:00:00Z'),
        sectorId: 'Sector-North',
        expectedAttendance: 65000,
      },
      {
        id: 'fix-2',
        name: 'Brazil vs Germany',
        teamA: 'Brazil',
        teamB: 'Germany',
        startTime: new Date('2026-07-12T15:00:00Z'),
        endTime: new Date('2026-07-12T17:00:00Z'),
        sectorId: 'Sector-South',
        expectedAttendance: 70000,
      },
    ];
  });

  it('should schedule conflict-free matches successfully', () => {
    const newFixture = {
      name: 'Italy vs Spain',
      teamA: 'Italy',
      teamB: 'Spain',
      startTime: new Date('2026-07-11T12:00:00Z'),
      endTime: new Date('2026-07-11T14:00:00Z'),
      sectorId: 'Sector-North',
      expectedAttendance: 50000,
    };

    const conflicts = scheduler.checkConflicts(newFixture, existingFixtures);
    expect(conflicts.length).toBe(0);
  });

  it('should flag venue/sector overlaps within time boundaries', () => {
    // Attempting to schedule 'Uruguay vs Portugal' at the same location ('Sector-North') 
    // overlapping with fixture-1 ('Argentina vs France' 18:00 - 20:00)
    const overlappingFixture = {
      name: 'Uruguay vs Portugal',
      teamA: 'Uruguay',
      teamB: 'Portugal',
      startTime: new Date('2026-07-10T19:00:00Z'),
      endTime: new Date('2026-07-10T21:00:00Z'),
      sectorId: 'Sector-North',
      expectedAttendance: 40000,
    };

    const conflicts = scheduler.checkConflicts(overlappingFixture, existingFixtures);
    expect(conflicts.some(c => c.type === 'venue-overlap')).toBe(true);
    expect(conflicts[0].severity).toBe('critical');
    expect(conflicts[0].conflictingFixtureIds).toContain('fix-1');
  });

  it('should enforce turn-around buffers between matches at same venue', () => {
    // Scheduled match ends at 20:00. This proposes a match starting at 20:30.
    // Buffer is 60 minutes, so this should trigger a warning/critical overlap conflict.
    const bufferConflictFixture = {
      name: 'Uruguay vs Portugal',
      teamA: 'Uruguay',
      teamB: 'Portugal',
      startTime: new Date('2026-07-10T20:30:00Z'),
      endTime: new Date('2026-07-10T22:30:00Z'),
      sectorId: 'Sector-North',
      expectedAttendance: 40000,
    };

    const conflicts = scheduler.checkConflicts(bufferConflictFixture, existingFixtures);
    expect(conflicts.some(c => c.type === 'venue-overlap')).toBe(true);
  });

  it('should flag team rest violations if scheduled too closely', () => {
    // France plays on July 10, 18:00 - 20:00. Proposing France vs USA on July 11, 20:00.
    // Difference is only 24 hours, which is under the 48-hour recovery minimum.
    const restPeriodFixture = {
      name: 'France vs United States',
      teamA: 'France',
      teamB: 'United States',
      startTime: new Date('2026-07-11T20:00:00Z'),
      endTime: new Date('2026-07-11T22:00:00Z'),
      sectorId: 'Sector-South',
      expectedAttendance: 50000,
    };

    const conflicts = scheduler.checkConflicts(restPeriodFixture, existingFixtures);
    expect(conflicts.some(c => c.type === 'team-rest-period')).toBe(true);
    // Severity should be warning since it does not overlap directly, but violates recovery window
    const restConflict = conflicts.find(c => c.type === 'team-rest-period')!;
    expect(restConflict.severity).toBe('warning');
    expect(restConflict.conflictingFixtureIds).toContain('fix-1');
  });

  it('should detect absolute and concurrent overcapacity overloads', () => {
    // Total stadium limit is 82,500. Proposing match with 90,000 fans.
    const overCapacityFixture = {
      name: 'England vs Netherlands',
      teamA: 'England',
      teamB: 'Netherlands',
      startTime: new Date('2026-07-15T18:00:00Z'),
      endTime: new Date('2026-07-15T20:00:00Z'),
      sectorId: 'Sector-North',
      expectedAttendance: 90000,
    };

    const conflicts = scheduler.checkConflicts(overCapacityFixture, existingFixtures);
    expect(conflicts.some(c => c.type === 'stadium-overcapacity')).toBe(true);
  });

  it('should find alternative slot timing recommendation when conflict exists', () => {
    const overlappingFixture = {
      name: 'Uruguay vs Portugal',
      teamA: 'Uruguay',
      teamB: 'Portugal',
      sectorId: 'Sector-North',
      expectedAttendance: 40000,
    };

    // Propose scheduling during peak conflict time on July 10
    const startSearch = new Date('2026-07-10T00:00:00Z');
    const endSearch = new Date('2026-07-10T23:59:59Z');

    const suggestion = scheduler.findAlternativeSlot(
      overlappingFixture,
      startSearch,
      endSearch,
      120, // 2 hours
      existingFixtures
    );

    expect(suggestion).not.toBeNull();
    // It should suggest a slot outside July 10, 18:00 - 20:00 (e.g., earlier in the day or after 21:30)
    const suggestedTime = suggestion!.toISOString();
    expect(suggestedTime).toBeDefined();
  });
});
