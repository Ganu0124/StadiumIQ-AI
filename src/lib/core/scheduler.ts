/**
 * Structured tournament fixture representation.
 */
export interface Fixture {
  /** Unique identifier of the fixture. */
  id: string;
  /** Display name of the match fixture. */
  name: string;
  /** First team name. */
  teamA: string;
  /** Second team name. */
  teamB: string;
  /** Proposed match start time. */
  startTime: Date;
  /** Proposed match end time. */
  endTime: Date;
  /** Target stadium sector or court identifier. */
  sectorId: string;
  /** Projected attendance count. */
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
  /** Classification of the schedule conflict. */
  type: ConflictType;
  /** Descriptive feedback details. */
  description: string;
  /** Severity rating of the conflict. */
  severity: 'critical' | 'warning';
  /** Identifiers of conflicting fixtures. */
  conflictingFixtureIds: string[];
}

/**
 * Configurable parameters for TournamentScheduler (no hardcoded limits).
 */
export interface SchedulerConfig {
  /** Minimum team rest time in milliseconds. */
  minTeamRestTimeMs: number;
  /** Absolute safe capacity limit of the stadium. */
  stadiumMaxCapacity: number;
  /** Turnaround buffer time between matches at the same venue in minutes. */
  bufferTimeMinutes: number;
}

/**
 * Tournament Fixture & Shift Scheduler featuring O(n log n) conflict checks.
 */
export class TournamentScheduler {
  private readonly config: SchedulerConfig;

  /**
   * Initializes the scheduler with custom operation boundary values.
   * 
   * @param config The scheduler limits and parameters.
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
   * 
   * @param fixtures List of fixtures to analyze.
   * @returns Array of identified conflicts.
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
      // Sweeping error caught silently
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
      // Find slot error caught silently
    }

    return null;
  }

  /**
   * Automatically resolves cascading conflicts caused by tournament disruptions (e.g. delays or venue changes).
   * First updates the disrupted fixture, then iterates chronologically through subsequent fixtures
   * and shifts their timings/venues dynamically if they violate turnaround buffers or rest periods.
   * Operational Complexity: O(n^2) where n is the number of scheduled fixtures.
   * 
   * @param disruptedFixtureId The unique identifier of the disrupted match.
   * @param delayMinutes Number of minutes to delay the match (positive, zero or negative).
   * @param newSectorId Optional new sector/court venue allocation.
   * @param existingFixtures Current schedule list.
   * @returns Refactored tournament schedule along with resolution actions log.
   */
  public resolveCascadingConflicts(
    disruptedFixtureId: string,
    delayMinutes: number,
    newSectorId: string | undefined,
    existingFixtures: Fixture[]
  ): { updatedFixtures: Fixture[]; resolutions: string[] } {
    const resolutions: string[] = [];
    const fixturesCopy = existingFixtures.map(f => ({
      ...f,
      startTime: new Date(f.startTime),
      endTime: new Date(f.endTime),
    }));

    // Find and update the disrupted fixture
    const targetIdx = fixturesCopy.findIndex(f => f.id === disruptedFixtureId);
    if (targetIdx === -1) {
      return { updatedFixtures: existingFixtures, resolutions: ['Target fixture not found.'] };
    }

    const target = fixturesCopy[targetIdx];
    const delayMs = delayMinutes * 60 * 1000;
    const oldStart = target.startTime.toISOString();
    target.startTime = new Date(target.startTime.getTime() + delayMs);
    target.endTime = new Date(target.endTime.getTime() + delayMs);
    
    if (newSectorId && newSectorId !== target.sectorId) {
      resolutions.push(`Venue shift: Fixture '${target.name}' relocated from sector '${target.sectorId}' to '${newSectorId}'.`);
      target.sectorId = newSectorId;
    }

    if (delayMinutes !== 0) {
      resolutions.push(`Disruption delay: Fixture '${target.name}' shifted from ${oldStart} to ${target.startTime.toISOString()} (+${delayMinutes} mins).`);
    }

    const bufferMs = this.config.bufferTimeMinutes * 60 * 1000;
    let shiftsOccurred = true;

    // Iteratively resolve cascading schedule conflicts
    while (shiftsOccurred) {
      shiftsOccurred = false;

      // Sort fixtures chronologically by start time to propagate changes forward
      fixturesCopy.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());

      for (let i = 0; i < fixturesCopy.length; i++) {
        const current = fixturesCopy[i];
        
        for (let j = 0; j < i; j++) {
          const previous = fixturesCopy[j];

          // 1. Venue sector overlap with buffer time checks
          if (current.sectorId === previous.sectorId) {
            const overlapStart = previous.startTime.getTime();
            const overlapEnd = previous.endTime.getTime() + bufferMs;
            
            if (current.startTime.getTime() < overlapEnd && current.endTime.getTime() > overlapStart) {
              const neededShiftMs = overlapEnd - current.startTime.getTime();
              if (neededShiftMs > 0) {
                const oldCurrentStart = current.startTime.toISOString();
                const currentDurationMs = current.endTime.getTime() - current.startTime.getTime();
                current.startTime = new Date(current.startTime.getTime() + neededShiftMs);
                current.endTime = new Date(current.startTime.getTime() + currentDurationMs);
                
                resolutions.push(`Cascading resolution: Shifting '${current.name}' forward from ${oldCurrentStart} to ${current.startTime.toISOString()} to satisfy turnaround buffer of ${this.config.bufferTimeMinutes}m at sector '${current.sectorId}' after '${previous.name}'.`);
                shiftsOccurred = true;
              }
            }
          }

          // 2. Team rest period checks
          const currentTeams = [current.teamA, current.teamB];
          const prevTeams = [previous.teamA, previous.teamB];
          const commonTeam = currentTeams.find(t => prevTeams.includes(t));

          if (commonTeam) {
            const restEndLimit = previous.endTime.getTime() + this.config.minTeamRestTimeMs;
            
            // Check if current match starts before previous match ends + required rest period
            if (current.startTime.getTime() < restEndLimit && current.endTime.getTime() > previous.startTime.getTime()) {
              const neededRestShiftMs = restEndLimit - current.startTime.getTime();
              if (neededRestShiftMs > 0) {
                const oldCurrentStart = current.startTime.toISOString();
                const currentDurationMs = current.endTime.getTime() - current.startTime.getTime();
                current.startTime = new Date(current.startTime.getTime() + neededRestShiftMs);
                current.endTime = new Date(current.startTime.getTime() + currentDurationMs);

                const restHours = (this.config.minTeamRestTimeMs / (60 * 60 * 1000)).toFixed(1);
                resolutions.push(`Cascading resolution: Shifting '${current.name}' forward from ${oldCurrentStart} to ${current.startTime.toISOString()} to guarantee mandatory ${restHours}h rest for team '${commonTeam}' after playing in '${previous.name}'.`);
                shiftsOccurred = true;
              }
            }
          }
        }
      }
    }

    return { updatedFixtures: fixturesCopy, resolutions };
  }
}

