import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

const MIME_TYPES: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.pdf': 'application/pdf',
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path: pathSegments } = await params;
    if (!pathSegments || pathSegments.length === 0) {
      return new NextResponse('Bad Request', { status: 400 });
    }

    const relPath = pathSegments.join('/');
    const ext = path.extname(relPath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    // Lista de rutas posibles donde puede residir el archivo en el contenedor
    const candidatePaths = [
      path.join(process.cwd(), 'public', 'images', relPath),
      path.join(process.cwd(), 'public', relPath),
      path.join(process.cwd(), '.next', 'standalone', 'public', 'images', relPath),
      path.join(process.cwd(), '.next', 'standalone', 'public', relPath),
    ];

    let foundPath: string | null = null;
    for (const p of candidatePaths) {
      if (fs.existsSync(p)) {
        foundPath = p;
        break;
      }
    }

    if (!foundPath) {
      return new NextResponse(`File not found: ${relPath}`, { status: 404 });
    }

    const fileBuffer = await fs.promises.readFile(foundPath);

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Content-Length': fileBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error('Error serving image:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
