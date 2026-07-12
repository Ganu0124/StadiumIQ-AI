/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { authorizeRequest, IncidentSchema } from '@/lib/core/security';
import { InMemoryCache } from '@/lib/core/cache';

const dbPath = path.join(process.cwd(), 'src/data/db.json');

// Initialize cache for incidents data (default 3-minute TTL)
const incidentsCache = new InMemoryCache<string, any>({
  maxSize: 10,
  defaultTtlMs: 3 * 60 * 1000,
});

const CACHE_KEY = 'stadium_incidents';

function readDb() {
  try {
    const fileData = fs.readFileSync(dbPath, 'utf8');
    return JSON.parse(fileData);
  } catch (error) {
    console.error('Failed to read operations JSON database:', error);
    throw new Error('Database Read Error');
  }
}

function writeDb(data: any) {
  try {
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf8');
  } catch (error) {
    console.error('Failed to write operations JSON database:', error);
    throw new Error('Database Write Error');
  }
}

/**
 * GET Active Incidents
 * Implements performance caching for operations dashboard responsiveness.
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
    console.error('GET Incidents API error:', error);
    return NextResponse.json({ error: 'Failed to read database' }, { status: 500 });
  }
}

/**
 * POST Log New Incident
 * Restricts access to admin, operations, security, and medical roles.
 * Includes Zod structure validation and dynamic XSS cleaning.
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
    const db = readDb();
    
    const newIncident = {
      id: `INC-${Date.now()}`,
      title: body.title,
      description: body.description,
      type: body.type,
      priority: body.priority,
      status: 'open',
      location: body.location,
      reportedAt: new Date().toISOString(),
    };

    db.incidents.push(newIncident);
    writeDb(db);

    // 3. Clear cache on update to guarantee consistency
    incidentsCache.delete(CACHE_KEY);

    return NextResponse.json(newIncident);
  } catch (error: any) {
    console.error('POST Incident API error:', error);
    return NextResponse.json({ error: 'Failed to write database', message: error.message }, { status: 500 });
  }
}
