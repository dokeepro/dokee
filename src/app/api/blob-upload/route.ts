import { put } from '@vercel/blob';
import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 60;

function toSafePathname(original: string): string {
    const lastDot = original.lastIndexOf('.');
    const ext = lastDot !== -1 ? original.slice(lastDot) : '';
    const stamp = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    return `${stamp}${ext}`;
}

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get('file');

        if (!file || !(file instanceof Blob)) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        const originalName = (formData.get('filename') as string) || 'upload';
        const safePathname = toSafePathname(originalName);

        const blob = await put(safePathname, file, {
            access: 'private',
            addRandomSuffix: false,
            token: process.env.BLOB_READ_WRITE_TOKEN,
        });

        console.log(`[blob-upload] uploaded ${originalName} -> ${blob.url} (${file.size} bytes)`);

        return NextResponse.json({ url: blob.url });
    } catch (error) {
        console.error('[blob-upload] error:', error);
        return NextResponse.json(
            { error: (error as Error).message },
            { status: 500 },
        );
    }
}
