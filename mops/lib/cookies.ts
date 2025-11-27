import { SignJWT, jwtVerify } from "jose";

const secret = new TextEncoder().encode(process.env.SESSION_SECRET!);
const alg = "HS256";

export type SessionPayload = { uid: string; email: string };

export async function createSession(value: SessionPayload) {
  return await new SignJWT(value)
    .setProtectedHeader({ alg })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);
}

export async function verifySession(token: string) {
  const { payload } = await jwtVerify(token, secret);
  return payload as SessionPayload;
}

export const cookieName = "session";
export const cookieOptions: Partial<CookieOptions> = {
  httpOnly: true,
  sameSite: "lax",
  secure: false,
  path: "/",
  maxAge: 60 * 60 * 24 * 7,
};

type CookieOptions = {
  httpOnly: boolean;
  sameSite: "lax" | "strict" | "none";
  secure: boolean;
  path: string;
  maxAge?: number;
};