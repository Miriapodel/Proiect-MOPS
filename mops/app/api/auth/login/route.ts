import { NextResponse } from "next/server";
import { loginSchema } from "@/lib/validators";
import { findUserByEmail, verifyPassword } from "@/lib/auth";
import { createSession, cookieName, cookieOptions } from "@/lib/cookies";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const { email, password } = parsed.data;

  const user = await findUserByEmail(email);
  if (!user) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const ok = await verifyPassword(password, user.password);
  if (!ok) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const token = await createSession({ uid: user.id, email: user.email });
  const res = NextResponse.json({ user: { id: user.id, email: user.email } });
  res.cookies.set(cookieName, token, cookieOptions);
  return res;
}