import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from 'next/server';
import { paths } from "./paths";
import { User } from "../next-auth";

async function Middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = await getToken({ req: request });
  const protector = {
    user: [paths.home as string],
    admin: paths.admin.overview,
  }

  if (pathname == "/") return NextResponse.redirect(new URL(paths.admin.overview, request.url))
  if (pathname == paths.auth.signIn && !token) return NextResponse.next();
  if (pathname == paths.auth.signIn && token) return NextResponse.redirect(new URL(paths.home, request.url))

  if (
    token == null &&
    (
      protector.user.includes(pathname) ||
      pathname.startsWith(protector.admin)
    )
  ) {
    return NextResponse.redirect(new URL(paths.auth.signIn, request.url))
  }

  const data: User = token as any;

  // admin access user
  if (protector.user.includes(pathname) && data.status == 0) return NextResponse.redirect(new URL(paths.admin.overview, request.url));
  // admin access ceo 
  if ((pathname.startsWith(paths.admin.admin) || pathname.startsWith(paths.admin.payment)) && data.status == 0) return NextResponse.redirect(new URL(paths.admin.overview, request.url));

  return NextResponse.next();
}

export default Middleware