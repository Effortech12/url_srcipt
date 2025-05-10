// src/app/api/check-single/route.ts
import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import puppeteer from 'puppeteer';
import { sendFailureEmail } from '@/lib/mail';



// Define a Result type
// interface Result {
//   url: string;
//   alias: string;
//   status: string;
//   responseCode: number;
//   reason: string;
//   time: string;
// }


type Result1 = {
  url: string;
  alias: string;
  status: string;
  responseCode: number;
  reason: string;
  time: string;
};



export async function POST(req: NextRequest) {
  const { url, alias } = await req.json();

  if (!url || !alias) {
    return NextResponse.json({ error: 'URL and alias are required' }, { status: 400 });
  }


  
  const result: Result1 = {
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
   
    // result.reason = error.message;
    if (error instanceof Error) {
      result.status = 'Failed';
      result.responseCode = 0;
      result.reason = error.message;
    } else {
      result.reason = 'Unknown error';
    }
  }

  const logFilePath = path.join(process.cwd(), 'public', 'logs', 'results.json');

  try {
    await fs.mkdir(path.dirname(logFilePath), { recursive: true });
    let existingResults: Result1[] = [];

    try {
      const fileData = await fs.readFile(logFilePath, 'utf8');
      existingResults = JSON.parse(fileData);
    } catch {}

    existingResults.push(result);
    await fs.writeFile(logFilePath, JSON.stringify(existingResults, null, 2), 'utf8');
    if (result.status === 'Failed') {
      await sendFailureEmail([result]);  // Send email alert
    }
  } catch {
    return NextResponse.json({ error: 'Failed to save results' }, { status: 500 });
  }

  //return NextResponse.json({ message: 'Check completed', result });
  return NextResponse.json({
    message: 'URL checked and email sent successfully',
    result,
    emailSent: true,
  });

  return NextResponse.json({
    message: 'URL checked but email failed',
    result,
    emailSent: false,
  });
  
}
