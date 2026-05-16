import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { getSupabaseEnv, isSupabaseConfigured } from '@/lib/supabase/env';

const PUBLIC_PREFIXES = [
  '/',
  '/login',
  '/signup',
  '/privacy',
  '/terms',
  '/setup',
  '/onboarding',
  '/api/webhooks',
  '/api/auth',
  '/api/inngest',
];
const AUTH_ROUTES = ['/login', '/signup'];

function isPublic(pathname: string): boolean {
  if (pathname === '/') return true;
  return PUBLIC_PREFIXES.some(
    (p) => p !== '/' && (pathname === p || pathname.startsWith(`${p}/`))
  );
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  if (!isSupabaseConfigured()) {
    if (isPublic(pathname)) {
      return NextResponse.next();
    }
    const url = request.nextUrl.clone();
    url.pathname = '/setup';
    return NextResponse.redirect(url);
  }

  let response = NextResponse.next({
    request: { headers: request.headers },
  });

  const { url, anonKey } = getSupabaseEnv();

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      get(name: string) {
        return request.cookies.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        request.cookies.set({ name, value, ...options });
        response = NextResponse.next({
          request: { headers: request.headers },
        });
        response.cookies.set({ name, value, ...options });
      },
      remove(name: string, options: CookieOptions) {
        request.cookies.set({ name, value: '', ...options });
        response = NextResponse.next({
          request: { headers: request.headers },
        });
        response.cookies.set({ name, value: '', ...options });
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user && !isPublic(pathname)) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = '/login';
    redirectUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(redirectUrl);
  }

  if (user && AUTH_ROUTES.includes(pathname)) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  const businessId = request.cookies.get('vyron_workspace')?.value;

  if (
    user &&
    businessId &&
    (pathname.startsWith('/dashboard') ||
      pathname.startsWith('/transactions') ||
      pathname.startsWith('/invoices') ||
      pathname.startsWith('/leads') ||
      pathname.startsWith('/billing') ||
      pathname.startsWith('/ai') ||
      pathname.startsWith('/reports') ||
      pathname.startsWith('/campaigns') ||
      pathname.startsWith('/documents') ||
      pathname.startsWith('/settings') ||
      pathname.startsWith('/analytics'))
  ) {
    const { data: sub } = await supabase
      .from('subscriptions')
      .select('status')
      .eq('business_id', businessId)
      .maybeSingle();

    const status = sub?.status ?? 'trialing';
    const writeBlocked = status === 'suspended';
    const readOnlyGrace =
      status === 'grace_period' || status === 'cancelled';
    const isMutation =
      request.method !== 'GET' && request.method !== 'HEAD';

    if (writeBlocked && isMutation && pathname.startsWith('/api')) {
      return NextResponse.json(
        { error: 'Account suspended' },
        { status: 403 }
      );
    }

    if (readOnlyGrace && isMutation && !pathname.startsWith('/billing')) {
      if (pathname.startsWith('/api')) {
        return NextResponse.json(
          { error: 'Read-only mode' },
          { status: 403 }
        );
      }
    }
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
