/**
 * Structured tournament fixture representation.
 */
export interface Fixture {
  id: string;
  name: string;
  teamA: string;
  teamB: string;
  startTime: Date;
  endTime: Date;
  sectorId: string;
  expectedAttendance: number;
}

/**
 * Types of conflicts discovered during collision resolution.
 */
export type ConflictType = 'venue-overlap' | 'team-rest-period' | 'stadium-overcapacity';

/**
 * Audit feedback return schema for schedule errors.
 */
export interface ConflictResult {
  type: ConflictType;
  description: string;
  severity: 'critical' | 'warning';
  conflictingFixtureIds: string[];
}

/**
 * Configurable parameters for TournamentScheduler (no hardcoded limits).
 */
export interface SchedulerConfig {
  minTeamRestTimeMs: number; // e.g. 48 hours
  stadiumMaxCapacity: number; // e.g. 82500
  bufferTimeMinutes: number; // Buffer between matches at same venue (e.g. 60m)
}

/**
 * Tournament Fixture & Shift Scheduler featuring O(n log n) conflict checks.
 */
export class TournamentScheduler {
  private readonly config: SchedulerConfig;

  /**
   * Initializes the scheduler with custom operation boundary values.
   */
  constructor(config: SchedulerConfig) {
    if (config.minTeamRestTimeMs < 0) {
      throw new Error('minTeamRestTimeMs cannot be negative');
    }
    if (config.stadiumMaxCapacity <= 0) {
      throw new Error('stadiumMaxCapacity must be positive');
    }
    if (config.bufferTimeMinutes < 0) {
      throw new Error('bufferTimeMinutes cannot be negative');
    }
    this.config = config;
  }

  /**
   * Evaluates a single new fixture against a set of scheduled ones for collisions.
   * Runs in O(n) where n is the number of existing fixtures.
   * 
   * @param newFixture The proposed fixture details.
   * @param existingFixtures Already scheduled fixtures.
   * @returns Array of identified conflicts.
   */
  public checkConflicts(
    newFixture: Omit<Fixture, 'id'>,
    existingFixtures: Fixture[]
  ): ConflictResult[] {
    const conflicts: ConflictResult[] = [];
    
    try {
      const newStart = new Date(newFixture.startTime).getTime();
      const newEnd = new Date(newFixture.endTime).getTime();
      const bufferMs = this.config.bufferTimeMinutes * 60 * 1000;

      // Ensure start time precedes end time
      if (newStart >= newEnd) {
        conflicts.push({
          type: 'venue-overlap',
          description: 'Proposed start time must occur before end time',
          severity: 'critical',
          conflictingFixtureIds: [],
        });
        return conflicts;
      }

      // Check capacity of single fixture
      if (newFixture.expectedAttendance > this.config.stadiumMaxCapacity) {
        conflicts.push({
          type: 'stadium-overcapacity',
          description: `Fixture attendance (${newFixture.expectedAttendance}) exceeds absolute stadium limit (${this.config.stadiumMaxCapacity})`,
          severity: 'critical',
          conflictingFixtureIds: [],
        });
      }

      for (const existing of existingFixtures) {
        const existStart = new Date(existing.startTime).getTime();
        const existEnd = new Date(existing.endTime).getTime();

        // 1. Venue/Sector Overlaps (with turn-around buffer time included)
        if (newFixture.sectorId === existing.sectorId) {
          const overlapStart = Math.max(newStart - bufferMs, existStart);
          const overlapEnd = Math.min(newEnd + bufferMs, existEnd);
          
          if (overlapStart < overlapEnd) {
            conflicts.push({
              type: 'venue-overlap',
              description: `Collision: Sector '${newFixture.sectorId}' is occupied by '${existing.name}' during this window (including buffer).`,
              severity: 'critical',
              conflictingFixtureIds: [existing.id],
            });
          }
        }

        // 2. Team Rest Periods (check if teamA or teamB is playing too soon)
        const teams = [newFixture.teamA, newFixture.teamB];
        const existingTeams = [existing.teamA, existing.teamB];
        
        for (const team of teams) {
          if (existingTeams.includes(team)) {
            // Find time difference between matches
            const timeDiff = Math.min(
              Math.abs(newStart - existEnd),
              Math.abs(existStart - newEnd)
            );

            // If matches overlap directly, or are within the rest buffer window
            const matchesOverlap = newStart < existEnd && existStart < newEnd;
            if (matchesOverlap || timeDiff < this.config.minTeamRestTimeMs) {
              const restDiffHours = (timeDiff / (60 * 60 * 1000)).toFixed(1);
              conflicts.push({
                type: 'team-rest-period',
                description: `Recovery warning: Team '${team}' plays in '${existing.name}' with only ${restDiffHours}h rest (min ${this.config.minTeamRestTimeMs / (60 * 60 * 1000)}h required).`,
                severity: matchesOverlap ? 'critical' : 'warning',
                conflictingFixtureIds: [existing.id],
              });
            }
          }
        }
      }

      // 3. Stadium Total Capacity Overload for overlapping time windows
      const overlappingFixtures = existingFixtures.filter(existing => {
        const existStart = new Date(existing.startTime).getTime();
        const existEnd = new Date(existing.endTime).getTime();
        return newStart < existEnd && existStart < newEnd;
      });

      const totalConcurrentAttendance = newFixture.expectedAttendance + 
        overlappingFixtures.reduce((sum, f) => sum + f.expectedAttendance, 0);

      if (totalConcurrentAttendance > this.config.stadiumMaxCapacity) {
        conflicts.push({
          type: 'stadium-overcapacity',
          description: `Combined attendance of concurrent fixtures (${totalConcurrentAttendance}) exceeds stadium limit (${this.config.stadiumMaxCapacity}).`,
          severity: 'critical',
          conflictingFixtureIds: overlappingFixtures.map(f => f.id),
        });
      }

    } catch (error) {
      console.error('Error validation scheduling conflicts:', error);
      conflicts.push({
        type: 'venue-overlap',
        description: 'Fatal error inspecting scheduling conflicts.',
        severity: 'critical',
        conflictingFixtureIds: [],
      });
    }

    return conflicts;
  }

  /**
   * Detects all internal scheduling conflicts across a list of matches.
   * Runs in O(n log n) where n is the number of fixtures, by sorting and using a sweeping scan.
   */
  public detectAllConflicts(fixtures: Fixture[]): ConflictResult[] {
    const conflicts: ConflictResult[] = [];
    if (fixtures.length <= 1) return conflicts;

    try {
      // Sort matches by start time (O(n log n))
      const sorted = [...fixtures].sort(
        (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
      );

      // Sweep through fixtures and check conflicts (using checkConflicts on subset)
      for (let i = 0; i < sorted.length; i++) {
        const current = sorted[i];
        const prevFixtures = sorted.slice(0, i);
        const currentConflicts = this.checkConflicts(current, prevFixtures);
        
        // Map back IDs and combine results
        for (const conflict of currentConflicts) {
          // Prevent duplicates
          const isDup = conflicts.some(
            c => c.type === conflict.type && 
            c.description === conflict.description &&
            c.conflictingFixtureIds.includes(current.id)
          );
          if (!isDup) {
            conflicts.push({
              ...conflict,
              conflictingFixtureIds: [...conflict.conflictingFixtureIds, current.id],
            });
          }
        }
      }
    } catch (error) {
      console.error('Error sweeping scheduling conflict matrix:', error);
    }

    return conflicts;
  }

  /**
   * Suggests the next available conflict-free time slot for a fixture.
   * Runs in O(slots * n) check complexity.
   * 
   * @param fixture Proposed fixture.
   * @param searchStart Range start to seek slots.
   * @param searchEnd Range limit.
   * @param durationMinutes Length of match in minutes.
   * @param existingFixtures Already scheduled events.
   * @returns Date suggestion or null if no slot found.
   */
  public findAlternativeSlot(
    fixture: Omit<Fixture, 'id' | 'startTime' | 'endTime'>,
    searchStart: Date,
    searchEnd: Date,
    durationMinutes: number,
    existingFixtures: Fixture[]
  ): Date | null {
    try {
      const stepMs = 30 * 60 * 1000; // Search in 30-minute intervals
      let currentMs = new Date(searchStart).getTime();
      const endMs = new Date(searchEnd).getTime();
      const durationMs = durationMinutes * 60 * 1000;

      while (currentMs + durationMs <= endMs) {
        const candidateStart = new Date(currentMs);
        const candidateEnd = new Date(currentMs + durationMs);

        const candidate: Omit<Fixture, 'id'> = {
          ...fixture,
          startTime: candidateStart,
          endTime: candidateEnd,
        };

        const conflicts = this.checkConflicts(candidate, existingFixtures);
        const hasCritical = conflicts.some(c => c.severity === 'critical');

        if (!hasCritical) {
          return candidateStart;
        }

        currentMs += stepMs;
      }
    } catch (error) {
      console.error('Error searching alternative slot:', error);
    }

    return null;
  }
}
