import { NextResponse } from "next/server";
import { cookieName } from "@/lib/cookies";

export async function POST() {
  const res = NextResponse.redirect(new URL("/login", process.env.NEXTAUTH_URL || "http://localhost:3000"));
  res.cookies.set(cookieName, "", { path: "/", maxAge: 0 });
  return res;
}