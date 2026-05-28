import { issueSignedToken, presignUrl } from '@vercel/blob';
import { NextRequest, NextResponse } from 'next/server';

function toSafePathname(original: string): string {
    const lastDot = original.lastIndexOf('.');
    const ext = lastDot !== -1 ? original.slice(lastDot) : '';
    const stamp = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    return `${stamp}${ext}`;
}

export async function POST(request: NextRequest) {
    try {
        const { pathname } = await request.json();
        const safePathname = toSafePathname(pathname);

        const signedToken = await issueSignedToken({
            token: process.env.BLOB_READ_WRITE_TOKEN!,
            pathname: safePathname,
            operations: ['put'],
        });

        const { presignedUrl } = await presignUrl(signedToken, {
            pathname: safePathname,
            operation: 'put',
            access: 'public',
        });

        return NextResponse.json({ uploadUrl: presignedUrl });
    } catch (error) {
        console.error('Blob presign error:', error);
        return NextResponse.json(
            { error: (error as Error).message },
            { status: 500 },
        );
    }
}
