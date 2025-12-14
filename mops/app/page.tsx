import { cookies } from "next/headers";
import { verifySession } from "@/lib/cookies";
import { getCurrentUser } from "@/lib/currentUser";

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
    <main className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-green-100">
          <h1 className="text-4xl font-bold text-green-900 mb-6">Dashboard</h1>
          <div className="space-y-4 mb-8">
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <p className="text-gray-700">
                <span className="font-semibold text-green-900">Signed in as:</span>{" "}
                {currentUser?.email ?? email}
              </p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <p className="text-gray-700">
                <span className="font-semibold text-green-900">Full name:</span>{" "}
                {currentUser?.firstName} {currentUser?.lastName}
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}