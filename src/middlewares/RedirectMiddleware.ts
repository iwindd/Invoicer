
import { paths } from "@/paths";
import { User } from "@prisma/client";
import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function RedirectMiddleware(request: NextRequest) {
  const token: User = await getToken({ req: request }) as any;

  if (token) {
    return NextResponse.rewrite(new URL(paths.admin.overview, request.url));
  }else{
    return NextResponse.rewrite(new URL(paths.auth.signIn, request.url));
  }

  return NextResponse.next();
}
