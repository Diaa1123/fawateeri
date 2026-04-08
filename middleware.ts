import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth';

// Public paths that don't require authentication
const publicPaths = ['/api/auth/login', '/api/webhook/make', '/login'];

// Admin-only paths
const adminOnlyPaths = ['/api/users', '/users'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public paths
  if (publicPaths.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // Check if the path requires authentication
  const requiresAuth =
    pathname.startsWith('/api/') ||
    pathname.startsWith('/(dashboard)') ||
    pathname.startsWith('/(admin)');

  if (!requiresAuth) {
    return NextResponse.next();
  }

  // Get token from Authorization header or cookie
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.replace('Bearer ', '') || request.cookies.get('token')?.value;

  if (!token) {
    return NextResponse.json(
      { success: false, error: 'غير مصرح. الرجاء تسجيل الدخول' },
      { status: 401 }
    );
  }

  // Verify token
  const payload = await verifyToken(token);

  if (!payload) {
    return NextResponse.json(
      { success: false, error: 'الجلسة منتهية. الرجاء تسجيل الدخول مرة أخرى' },
      { status: 401 }
    );
  }

  // Check if the path requires admin role
  const requiresAdmin = adminOnlyPaths.some((path) => pathname.startsWith(path));

  if (requiresAdmin && payload.role !== 'admin') {
    return NextResponse.json(
      { success: false, error: 'غير مصرح. هذه الصفحة للأدمن فقط' },
      { status: 403 }
    );
  }

  // Team role can only access /add page
  if (payload.role === 'team') {
    // Allow /add and /api/invoices (POST only for adding invoices)
    const allowedForTeam = pathname === '/add' || pathname.startsWith('/api/invoices');

    if (!allowedForTeam) {
      // Redirect to /add for page requests (including root /)
      if (!pathname.startsWith('/api/')) {
        const url = request.nextUrl.clone();
        url.pathname = '/add';
        return NextResponse.redirect(url);
      }
      // Block API requests
      return NextResponse.json(
        { success: false, error: 'غير مصرح. فريق العمل يمكنه فقط الوصول لصفحة إضافة الفواتير' },
        { status: 403 }
      );
    }
  }

  // Add user info to headers for route handlers
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-user-id', payload.userId);
  requestHeaders.set('x-user-role', payload.role);
  requestHeaders.set('x-username', payload.username);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
