/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import { authorizeRequest, IncidentSchema } from '@/lib/core/security';
import { InMemoryCache } from '@/lib/core/cache';
import { readDb, runTransaction } from '@/lib/core/db';

// Initialize cache for incidents data (default 3-minute TTL)
const incidentsCache = new InMemoryCache<string, any>({
  maxSize: 10,
  defaultTtlMs: 3 * 60 * 1000,
});

const CACHE_KEY = 'stadium_incidents';

/**
 * GET Active Incidents
 * Implements performance caching for operations dashboard responsiveness.
 * Operational Complexity: O(1) on cache hit; O(N) on cache miss where N is DB size.
 * 
 * @returns NextResponse containing the active incidents array.
 */
export async function GET() {
  try {
    // Attempt cache hit
    const cachedData = incidentsCache.get(CACHE_KEY);
    if (cachedData !== undefined) {
      return NextResponse.json(cachedData, {
        headers: { 'X-Cache': 'HIT' }
      });
    }

    const db = readDb();
    
    // Write query to cache
    incidentsCache.set(CACHE_KEY, db.incidents);

    return NextResponse.json(db.incidents, {
      headers: { 'X-Cache': 'MISS' }
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to read database' }, { status: 500 });
  }
}

/**
 * POST Log New Incident
 * Restricts access to admin, operations, security, and medical roles.
 * Includes Zod structure validation, dynamic XSS cleaning, and concurrency locks.
 * Operational Complexity: O(N) where N is database size.
 * 
 * @param request The incoming HTTP request.
 * @returns NextResponse containing the newly created incident item.
 */
export async function POST(request: Request) {
  try {
    // 1. Enforce RBAC validation guard
    const auth = await authorizeRequest(
      request, 
      ['admin', 'operations', 'security', 'medical'], 
      3
    );
    if (!auth.authorized) {
      return auth.errorResponse || NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Validate payload using IncidentSchema (automatically cleans dynamic text fields)
    const rawBody = await request.json();
    const validation = IncidentSchema.safeParse(rawBody);

    if (!validation.success) {
      return NextResponse.json({
        error: 'Validation Failed',
        details: validation.error.format()
      }, { status: 400 });
    }

    const body = validation.data;
    
    const newIncident = await runTransaction((db) => {
      const incident = {
        id: `INC-${Date.now()}`,
        title: body.title,
        description: body.description,
        type: body.type,
        priority: body.priority,
        status: 'open',
        location: body.location,
        reportedAt: new Date().toISOString(),
      };

      db.incidents.push(incident);
      return incident;
    });

    // 3. Clear cache on update to guarantee consistency
    incidentsCache.delete(CACHE_KEY);

    return NextResponse.json(newIncident);
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to write database', message: error.message }, { status: 500 });
  }
}

