import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function proxy(request: NextRequest) {
  // Start with a passthrough response — may be replaced if cookies are refreshed.
  let response = NextResponse.next({ request });

  // Build a Supabase client that reads cookies from the request and writes
  // refreshed tokens back to both the forwarded request and the response.
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // Propagate refreshed tokens to the downstream request headers …
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          // … and recreate the response so those headers reach the browser too.
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // getUser() validates the JWT server-side and refreshes the session if expired.
  // Never use getSession() in proxy — it trusts unvalidated cookie data.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isAdminLogin = pathname === '/admin/login';
  const isAdminRoute = pathname.startsWith('/admin');

  // Unauthenticated user hitting a protected admin route → login page.
  if (isAdminRoute && !isAdminLogin && !user) {
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }

  // Authenticated user hitting the login page → admin dashboard.
  if (isAdminLogin && user) {
    return NextResponse.redirect(new URL('/admin', request.url));
  }

  return response;
}

export const config = {
  matcher: ['/admin/:path*'],
};
