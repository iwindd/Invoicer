import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { paths } from "./paths";
import { User } from "../next-auth";

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname || "/";
  const originalUrl = process.env.NEXTAUTH_URL + request.nextUrl.pathname
  const token: User = (await getToken({ req: request })) as any;

  function matches(pattern: string): boolean {
    const modifiedPattern = pattern
      .replace(/\/:\w+\*/g, "(?:/.*)?")
      .replace(/:\w+/g, "[^/]+")
      .replace(/\//g, "\\/");
    const regex = new RegExp(`^${modifiedPattern}$`);
    const state = regex.test(path);

    return state;
  }

  // redirect auth
  if (matches("/auth/:path*")) {
    if (token) {
      return NextResponse.rewrite(new URL(paths.admin.overview, originalUrl));
    }
  } else {
    if (!token) {
      return NextResponse.rewrite(new URL(paths.auth.signIn, originalUrl));
    }
  }

  // redirect index
  if (matches("/") || !token) {
    if (token) {
      return NextResponse.rewrite(new URL(paths.admin.overview, originalUrl));
    } else {
      return NextResponse.rewrite(new URL(paths.auth.signIn, originalUrl));
    }
  }

  // admin guard
  if (matches("/admin/payment/:path*") || matches("/admin/admin/:path*")) {
    if (token?.status != 1) {
      return NextResponse.rewrite(new URL(paths.admin.overview, originalUrl));
    }
  }

  // root guard
  if (matches("/admin/applications/:path*")) {
    if (token?.root != true) {
      return NextResponse.rewrite(new URL(paths.admin.overview, originalUrl));
    }
  }

  return NextResponse.next();
}

export const config = {
  /*
   * Match all paths except for:
   * 1. /api/ routes
   * 2. /_next/ (Next.js internals)
   * 3. /_static (inside /public)
   * 4. /_vercel (Vercel internals)
   * 5. Static files (e.g. /favicon.ico, /sitemap.xml, /robots.txt, etc.)
   */
  matcher: ["/((?!api/|_next/|_static|_vercel|[\\w-]+\\.\\w+).*)"],
};
