import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { NextResponse } from 'next/server';

export async function POST(request: Request): Promise<NextResponse> {
    try {
        const body = (await request.json()) as HandleUploadBody;

        const jsonResponse = await handleUpload({
            body,
            request,
            token: process.env.BLOB_READ_WRITE_TOKEN,
            onBeforeGenerateToken: async () => {
                return {
                    addRandomSuffix: true,
                    tokenPayload: JSON.stringify({}),
                };
            },
            onUploadCompleted: async () => {},
        });

        return NextResponse.json(jsonResponse);
    } catch (error) {
        console.error('Blob upload error:', error);
        return NextResponse.json(
            { error: (error as Error).message },
            { status: 400 },
        );
    }
}
