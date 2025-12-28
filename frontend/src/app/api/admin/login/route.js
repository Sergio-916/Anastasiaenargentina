import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function POST(request) {
    try {
        const body = await request.json();
        const { email, password } = body;

        if (!email || !password) {
            return NextResponse.json(
                { error: 'Email and password are required' },
                { status: 400 }
            );
        }

        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.BACKEND_URL || 'http://127.0.0.1:8000';
        
        // Create FormData for OAuth2PasswordRequestForm
        const formData = new FormData();
        formData.append('username', email);
        formData.append('password', password);

        const res = await fetch(`${backendUrl}/api/v1/login/access-token`, {
            method: 'POST',
            body: formData,
            cache: 'no-store',
        });

        if (!res.ok) {
            const errorData = await res.json().catch(() => ({ detail: 'Authentication failed' }));
            return NextResponse.json(
                { error: errorData.detail || 'Invalid credentials' },
                { status: res.status }
            );
        }

        const data = await res.json();
        return NextResponse.json(data, { status: 200 });
    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to connect to server. Make sure the backend is running.' },
            { status: 500 }
        );
    }
}

