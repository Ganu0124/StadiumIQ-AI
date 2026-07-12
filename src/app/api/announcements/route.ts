/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { authorizeRequest, AnnouncementSchema } from '@/lib/core/security';
import { InMemoryCache } from '@/lib/core/cache';

const dbPath = path.join(process.cwd(), 'src/data/db.json');

// Initialize cache for announcements list (default 10-minute TTL)
const announcementsCache = new InMemoryCache<string, any>({
  maxSize: 10,
  defaultTtlMs: 10 * 60 * 1000,
});

const CACHE_KEY = 'stadium_announcements';

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
 * GET Announcements
 * Features high-performance caching for rapid dashboard rendering.
 */
export async function GET() {
  try {
    // Attempt cache hit
    const cachedData = announcementsCache.get(CACHE_KEY);
    if (cachedData !== undefined) {
      return NextResponse.json(cachedData, {
        headers: { 'X-Cache': 'HIT' }
      });
    }

    const db = readDb();
    
    // Write query to cache
    announcementsCache.set(CACHE_KEY, db.announcements);

    return NextResponse.json(db.announcements, {
      headers: { 'X-Cache': 'MISS' }
    });
  } catch (error) {
    console.error('GET Announcements API error:', error);
    return NextResponse.json({ error: 'Failed to read database' }, { status: 500 });
  }
}

/**
 * POST New Announcement
 * Authorized: admin, operations only. Includes Zod schema verification and XSS sanitization.
 */
export async function POST(request: Request) {
  try {
    // 1. Enforce RBAC guard
    const auth = await authorizeRequest(request, ['admin', 'operations'], 4);
    if (!auth.authorized) {
      return auth.errorResponse || NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Parse and Validate body payload with Zod Schema (automatically sanitizes string fields)
    const rawBody = await request.json();
    const validation = AnnouncementSchema.safeParse(rawBody);

    if (!validation.success) {
      return NextResponse.json({
        error: 'Validation Failed',
        details: validation.error.format()
      }, { status: 400 });
    }

    const body = validation.data;
    const db = readDb();
    
    const newAnnouncement = {
      id: `ann-${Date.now()}`,
      title: body.title,
      message: body.message,
      type: body.type,
      language: body.language,
      createdAt: new Date().toISOString(),
      status: 'published',
      generatedByAI: body.generatedByAI,
    };

    db.announcements.push(newAnnouncement);
    writeDb(db);

    // 3. Evict cache on state modification
    announcementsCache.delete(CACHE_KEY);

    return NextResponse.json(newAnnouncement);
  } catch (error: any) {
    console.error('POST Announcement API error:', error);
    return NextResponse.json({ error: 'Failed to write database', message: error.message }, { status: 500 });
  }
}
