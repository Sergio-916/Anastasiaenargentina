import { NextResponse } from 'next/server';

export async function POST(request) {
    try {
        const body = await request.json();
        const backendUrl = process.env.BACKEND_URL || 'http://127.0.0.1:8000';
        const res = await fetch(`${backendUrl}/api/v1/contacts/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
            cache: 'no-store',
        });

        if (!res.ok) {
            const errorData = await res.json().catch(() => ({ error: 'Unknown error' }));
            return NextResponse.json(
                { error: errorData.detail || errorData.error || 'Failed to send contact message' },
                { status: res.status }
            );
        }

        const data = await res.json();
        return NextResponse.json(data, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

