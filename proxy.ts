import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const protectedRoutes = ["/dashboard", "/tournaments", "/bankroll", "/profile"];

function isProtectedRoute(pathname: string) {
  return protectedRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
}

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !publishableKey) {
    if (isProtectedRoute(request.nextUrl.pathname)) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    return response;
  }

  const supabase = createServerClient(url, publishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, options, value }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user && isProtectedRoute(request.nextUrl.pathname)) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/tournaments/:path*",
    "/bankroll/:path*",
    "/profile/:path*",
  ],
};
