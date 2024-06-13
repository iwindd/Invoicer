import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from 'next/server';
import { paths } from "./paths";
import { User } from "../next-auth";

async function Middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const originalUrl = process.env.NEXTAUTH_URL + request.nextUrl.pathname
  const token: User = await getToken({ req: request }) as any;

  if (pathname != paths.auth.signIn && !token) return NextResponse.redirect(new URL(paths.auth.signIn, originalUrl)); // if no login
  if (pathname == paths.auth.signIn && token) return NextResponse.redirect(new URL(paths.admin.overview, originalUrl)); // if already login
  if (pathname == "/") return NextResponse.redirect(new URL(paths.admin.overview, originalUrl));
  if (pathname.startsWith(paths.admin.overview) && !token) return NextResponse.redirect(new URL(paths.auth.signIn, originalUrl));
  if ((pathname.startsWith(paths.admin.admin) || pathname.startsWith(paths.admin.payment)) && token.status == 0) return NextResponse.redirect(new URL(paths.admin.overview, originalUrl));

  return NextResponse.next();
}

export default Middleware