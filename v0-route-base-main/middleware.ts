import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Define protected routes
    const isDashboardRoute = pathname.startsWith('/dashboard');
    const isMerchantDashboard = pathname.match(/^\/[^/]+\/dashboard/);

    // Mock check for authentication (replace with real logic)
    const isAuthenticated = request.cookies.has('sessionid') || request.cookies.has('auth_token');

    if ((isDashboardRoute || isMerchantDashboard) && !isAuthenticated) {
        // Redirect to login if not authenticated
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('callbackUrl', pathname);
        return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/dashboard/:path*',
        '/:slug/dashboard/:path*',
        '/profile/:path*',
    ],
};
