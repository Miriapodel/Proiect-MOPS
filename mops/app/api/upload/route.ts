import { NextRequest, NextResponse } from 'next/server';
import { persistUpload } from '@/services/upload.service';
import { isAppError } from '@/lib/errors';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file was uploaded' },
        { status: 400 }
      );
    }

    try {
      const incidentId = formData.get('incidentId') as string | null;
      const { photoId } = await persistUpload(file, incidentId ?? undefined);
      return NextResponse.json({ photoId }, { status: 200 });
    } catch (err) {
      if (isAppError(err)) {
        return NextResponse.json({ error: err.message, code: err.code }, { status: err.status });
      }
      throw err;
    }
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Error uploading file' },
      { status: 500 }
    );
  }
}

