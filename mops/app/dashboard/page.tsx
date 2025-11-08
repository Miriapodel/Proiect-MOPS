import { cookies } from "next/headers";
import { verifySession } from "@/lib/cookies";
import { LogoutButton } from "../components/LogoutButton";

export default async function Dashboard() {
  const token = (await cookies()).get("session")?.value;
  let email = "unknown";
  if (token) {
    try {
      const s = await verifySession(token);
      email = s.email;
    } catch {}
  }
  return (
    <main style={{ maxWidth: 720, margin: "3rem auto" }}>
      <h1>Dashboard</h1>
      <p>Signed in as {email}</p>
      <form action="/api/auth/logout" method="post">
        <LogoutButton />
      </form>
    </main>
  );
}