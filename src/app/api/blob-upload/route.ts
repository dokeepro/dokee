import { issueSignedToken, presignUrl } from '@vercel/blob';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const { pathname } = await request.json();

        const signedToken = await issueSignedToken({
            token: process.env.BLOB_READ_WRITE_TOKEN!,
            pathname,
            operations: ['put'],
        });

        const { presignedUrl } = await presignUrl(signedToken, {
            pathname,
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
