import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { contentTypeFor, imagePath } from '@/utils/uploads';

export async function GET(req: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  const filename = (await params).filename; // Get the dynamic filename
  try {
    const fileBuffer = await readFile(imagePath(filename));
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentTypeFor(filename),
        // Upload names carry a timestamp, so a given name rarely changes
        'Cache-Control': 'public, max-age=86400',
      },
    });
  } catch {
    return NextResponse.json({ error: 'File not found' }, { status: 404 });
  }
}
