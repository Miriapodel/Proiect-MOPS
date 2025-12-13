import { NextResponse } from "next/server";
import { loginSchema } from "@/lib/validators";
import { requireUserByEmail, verifyPassword } from "@/lib/auth";
import { isAppError } from "@/lib/errors";
import { createSession, cookieName, cookieOptions } from "@/lib/cookies";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const { email, password } = parsed.data;

  let user;
  try {
    user = await requireUserByEmail(email);
  } catch (err) {
    if (isAppError(err)) {
      return NextResponse.json({ error: "Invalid credentials", code: err.code }, { status: 401 });
    }
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
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