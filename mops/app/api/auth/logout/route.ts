import { NextResponse } from "next/server";
import { cookieName } from "@/lib/cookies";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(cookieName, "", { path: "/", maxAge: 0 });
  return res;
}