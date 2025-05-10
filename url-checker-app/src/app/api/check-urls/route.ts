import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import puppeteer from 'puppeteer';
import { sendFailureEmail } from '@/lib/mail';

export async function POST(req: NextRequest) {
  const data = await req.formData();
  const file = data.get('file') as File;

  if (!file) {
    return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const urlsJson = JSON.parse(buffer.toString());

  const results = [];

  for (const { url, alias } of urlsJson) {
    const result = {
      url,
      alias,
      status: 'OK',
      responseCode: 200,
      reason: 'Success',
      time: new Date().toLocaleString(),
    };

    try {
      const browser = await puppeteer.launch({ headless: true });
      const page = await browser.newPage();
      const response = await page.goto(url, { waitUntil: 'networkidle2' });

      if (!response || response.status() !== 200) {
        result.status = 'Failed';
        result.responseCode = response?.status() || 0;
        result.reason = await page.title();
      }

      await browser.close();
    } catch (error: unknown) {
      result.status = 'Failed';
      result.responseCode = 0;
      // result.reason = error.message;
      if (error instanceof Error) {
        result.reason = error.message;
      } else {
        result.reason = 'Unknown error';
      }
    }

    results.push(result);
  }

  const logPath = path.join(process.cwd(), 'public', 'logs');
  await fs.mkdir(logPath, { recursive: true });
  const filename = `results-${Date.now()}.json`;
  const filePath = path.join(logPath, filename);

  await fs.writeFile(filePath, JSON.stringify(results, null, 2), 'utf8');
  const failedUrls = results.filter(r => r.status === 'Failed');
  await sendFailureEmail(failedUrls);
  return NextResponse.json({ message: 'Check completed', results, logFile: `/logs/${filename}` });
}
