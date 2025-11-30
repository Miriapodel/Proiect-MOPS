import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { registerSchema } from "@/lib/validators";
import { createUser, findUserByEmail } from "@/lib/auth";
import { isAppError } from "@/lib/errors";
import { createSession, cookieName, cookieOptions } from "@/lib/cookies";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const { email, firstName, lastName, password } = parsed.data;

  const exists = await findUserByEmail(email);
  if (exists) {
    return NextResponse.json({ error: "Email already in use" }, { status: 409 });
  }

  let user;
  try {
    user = await createUser({ email, firstName, lastName, password });
  } catch (err) {
    if (isAppError(err)) {
      return NextResponse.json({ error: err.message, code: err.code }, { status: err.status });
    }
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
  const token = await createSession({ uid: user.id, email: user.email });

  const res = NextResponse.json({ user }, { status: 201 });
  res.cookies.set(cookieName, token, cookieOptions);

  return res;
}