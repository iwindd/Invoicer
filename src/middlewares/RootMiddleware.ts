
import { paths } from "@/paths";
import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";
import { User } from "../../next-auth";

export async function RootMiddleware(request: NextRequest) {
  const token: User = await getToken({ req: request }) as any;

  if (token && token?.root != true) {
    return NextResponse.rewrite(new URL(paths.admin.overview, request.url));
  }

  return NextResponse.next();
}
