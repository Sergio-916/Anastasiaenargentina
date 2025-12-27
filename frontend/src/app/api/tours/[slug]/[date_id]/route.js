import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
    try {
        const { slug, date_id } = await params;
        const backendUrl = process.env.BACKEND_URL || 'http://127.0.0.1:8000';
        const res = await fetch(`${backendUrl}/api/v1/tours/${slug}/${date_id}`, {
            cache: 'no-store',
        });

        if (!res.ok) {
            if (res.status === 404) {
                return NextResponse.json({ error: 'Tour not found' }, { status: 404 });
            }
            throw new Error(`Backend responded with status: ${res.status}`);
        }

        const data = await res.json();
        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

