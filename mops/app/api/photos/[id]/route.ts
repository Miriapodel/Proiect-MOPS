import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const photo = await prisma.photo.findUnique({ where: { id }, select: { data: true, mimeType: true, size: true } });
    if (!photo) {
        return new NextResponse('Not Found', { status: 404 });
    }
    const bytes = photo.data instanceof Buffer ? photo.data : Buffer.from(photo.data as any);
    return new NextResponse(bytes, {
        status: 200,
        headers: {
            'Content-Type': photo.mimeType,
            'Content-Length': String(bytes.length || photo.size || 0),
            'Cache-Control': 'public, max-age=31536000, immutable',
        },
    });
}
