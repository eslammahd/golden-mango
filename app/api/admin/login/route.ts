import { NextRequest, NextResponse } from "next/server";

const ADMIN_EMAIL = "dr.saad@drsaadelmahdy.com";
const ADMIN_PASSWORD = "DrSaad2024!";

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

  if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const sessionToken = Buffer.from(`${email}:${Date.now()}`).toString("base64");
  const response = NextResponse.json({ ok: true });
  response.cookies.set("admin_session", sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 8,
    path: "/",
  });
  return response;
}
