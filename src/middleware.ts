import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { pathToRegexp } from './libs/regexp';
import { getToken } from 'next-auth/jwt';
import { paths } from './paths';
import { User } from '../next-auth';

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname || '/';
  const token: User = await getToken({ req: request }) as any;

  function matches(pattern: string): boolean {
    return pathToRegexp(pattern).test(path);
  }

  // redirect auth
  if (matches("/auth/:path*")){
    if (token) {
      return NextResponse.rewrite(new URL(paths.admin.overview, request.url));
    }
  }else{
    if (!token) {
      return NextResponse.rewrite(new URL(paths.auth.signIn, request.url));
    }
  }

  // redirect index 
  if (matches("/") || !token){
    if (token) {
      return NextResponse.rewrite(new URL(paths.admin.overview, request.url));
    }else{
      return NextResponse.rewrite(new URL(paths.auth.signIn, request.url));
    }
  }

  // admin guard
  if (matches("/admin/payment/:path*") || matches("/admin/admin/:path*")){
    if (token?.status != 1) {
      return NextResponse.rewrite(new URL(paths.admin.overview, request.url));
    }
  }

  // root guard
  if (matches("/admin/applications/:path*")){
    if (token?.root != true) {
      return NextResponse.rewrite(new URL(paths.admin.overview, request.url));
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
  matcher: ['/((?!api/|_next/|_static|_vercel|[\\w-]+\\.\\w+).*)'],
};