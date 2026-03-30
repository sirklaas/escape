import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const JSON_PATH = path.join(process.cwd(), 'public', 'escapedata.json');

export async function GET() {
  try {
    const raw = fs.readFileSync(JSON_PATH, 'utf-8');
    return NextResponse.json(JSON.parse(raw));
  } catch {
    return NextResponse.json({ error: 'Could not read escapedata.json' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();

    if (!data?.pages || !Array.isArray(data.pages)) {
      return NextResponse.json({ success: false, error: 'Invalid data structure' }, { status: 400 });
    }

    // Backup existing file
    if (fs.existsSync(JSON_PATH)) {
      const ts = new Date().toISOString().replace(/[:.]/g, '-');
      fs.copyFileSync(JSON_PATH, JSON_PATH + `.backup.${ts}`);
    }

    fs.writeFileSync(JSON_PATH, JSON.stringify(data, null, 2), 'utf-8');

    return NextResponse.json({
      success: true,
      message: 'Saved successfully',
      pages_count: data.pages.length,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
