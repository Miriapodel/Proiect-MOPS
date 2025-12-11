import { requireAdmin } from "@/lib/requireAdmin";
import { redirect } from "next/navigation";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  try {
    await requireAdmin();
  } catch {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-green-900">Admin Dashboard</h1>
          <p className="mt-2 text-lg text-green-700">
            System statistics and management
          </p>
        </div>
        {children}
      </div>
    </div>
  );
}
