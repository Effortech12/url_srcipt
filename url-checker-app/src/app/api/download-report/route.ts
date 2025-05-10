import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';

export async function GET() {
  const filePath = path.join(process.cwd(), 'public', 'logs', 'results.json');

  if (!fs.existsSync(filePath)) {
    return new NextResponse('Report file not found', { status: 404 });
  }

  const fileBuffer = fs.readFileSync(filePath);

  return new NextResponse(fileBuffer, {
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': 'attachment; filename="results.json"',
    },
  });
}
