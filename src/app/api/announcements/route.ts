import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const dbPath = path.join(process.cwd(), 'src/data/db.json');

function readDb() {
  const fileData = fs.readFileSync(dbPath, 'utf8');
  return JSON.parse(fileData);
}

function writeDb(data: any) {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf8');
}

export async function GET() {
  try {
    const db = readDb();
    return NextResponse.json(db.announcements);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to read database' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const db = readDb();
    
    const newAnnouncement = {
      id: `ann-${Date.now()}`,
      title: body.title || 'Operations Announcement',
      message: body.message,
      type: body.type || 'info',
      language: body.language || 'en',
      createdAt: new Date().toISOString(),
      status: 'published',
      generatedByAI: !!body.generatedByAI,
    };

    db.announcements.push(newAnnouncement);
    writeDb(db);

    return NextResponse.json(newAnnouncement);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to write database' }, { status: 500 });
  }
}
