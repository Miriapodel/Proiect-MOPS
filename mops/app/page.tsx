import { cookies } from "next/headers";
import { verifySession } from "@/lib/cookies";
import { getCurrentUser } from "@/lib/currentUser";
import { LogoutButton } from "./components/LogoutButton";

export default async function Dashboard() {
  const token = (await cookies()).get("session")?.value;
  const currentUser = await getCurrentUser();

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
      <p>Signed in as {currentUser?.email ?? email}</p>
      <p>Full name: {currentUser?.firstName} {currentUser?.lastName}</p>
      <form action="/api/auth/logout" method="post">
        <LogoutButton />
      </form>
    </main>
  );
}