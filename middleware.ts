import { NextRequest, NextResponse } from "next/server";

export const config = { matcher: ["/admin/:path*"] };

export function middleware(req: NextRequest) {
  const u = process.env.ADMIN_USER, p = process.env.ADMIN_PASSWORD;
  if (!u || !p) return new NextResponse("Admin non configuré", { status: 503 });
  const h = req.headers.get("authorization");
  if (h?.startsWith("Basic ")) {
    const [user, ...rest] = atob(h.slice(6)).split(":");
    if (user === u && rest.join(":") === p) return NextResponse.next();
  }
  return new NextResponse("Authentification requise", { status: 401, headers: { "WWW-Authenticate": 'Basic realm="Admin"' } });
}
