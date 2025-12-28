import { NextResponse } from 'next/server'

export function middleware(request) {
    const { pathname } = request.nextUrl

    // Proxy paths to backend
    if (
        pathname.startsWith('/admin') ||
        pathname.startsWith('/docs') ||
        pathname.startsWith('/api') ||
        pathname === '/openapi.json'
    ) {
        // Construct destination URL
        // Ensure trailing slash for /admin to avoid backend unnecessary redirect logic if possible, 
        // but usually exact mapping is safer if we handle headers.
        // Use the backend internal hostname
        const url = new URL(pathname, 'http://backend:8000')
        url.search = request.nextUrl.search

        // Create new headers, preserving the original Host header (or setting X-Forwarded-Host)
        // IMPORTANT: Next.js 'rewrite' usually overwrites Host to destination. 
        // We want the backend to generate links with the ORIGINAL host.
        const requestHeaders = new Headers(request.headers)

        // Explicitly set the Host header to the original host ? 
        // Some proxies might reject this if strictly checking Host vs Destination IP.
        // Ideally we set X-Forwarded-Host.
        requestHeaders.set('x-forwarded-host', request.headers.get('host'))
        requestHeaders.set('x-forwarded-proto', request.headers.get('x-forwarded-proto') || 'https')


        // Rewrite the response to the destination
        return NextResponse.rewrite(url, {
            request: {
                headers: requestHeaders,
            },
        })
    }

    return NextResponse.next()
}

export const config = {
    matcher: [
        '/admin/:path*',
        '/docs/:path*',
        '/api/:path*',
        '/openapi.json'
    ],
}
