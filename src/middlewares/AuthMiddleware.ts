import { paths } from "@/paths";
import { User } from "@prisma/client";
import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function AuthMiddleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token: User = await getToken({ req: request }) as any;

  if (pathname == paths.auth.signIn ) {
    if (token) {
      return NextResponse.redirect(new URL(paths.admin.overview, request.url));
    }else{
      return NextResponse.next();
    }
  }else{
    if (!token) {
      return NextResponse.redirect(new URL(paths.auth.signIn, request.url));
    }
  }

  return NextResponse.next();
}
