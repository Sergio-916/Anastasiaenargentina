import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function POST(request) {
    try {
        const body = await request.json();
        const { token } = body;

        if (!token) {
            return NextResponse.json(
                { error: 'Token is required' },
                { status: 400 }
            );
        }

        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.BACKEND_URL || 'http://127.0.0.1:8000';
        
        const res = await fetch(`${backendUrl}/api/v1/login/test-token`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
            cache: 'no-store',
        });

        if (!res.ok) {
            return NextResponse.json(
                { error: 'Invalid token' },
                { status: 401 }
            );
        }

        const data = await res.json();
        return NextResponse.json(data, { status: 200 });
    } catch (error) {
        console.error('Token verification error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to verify token' },
            { status: 500 }
        );
    }
}

