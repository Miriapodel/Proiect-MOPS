import RoleAdminPanel from "@/app/components/RoleAdminPanel";

export const dynamic = "force-dynamic";

export default function AdminRolesPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 py-10 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-green-100">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-green-900">Administrare roluri</h1>
            <p className="text-gray-600 mt-1">Setează rolurile pentru utilizatori (Citizen / Operator / Admin)</p>
          </div>
          <RoleAdminPanel />
        </div>
      </div>
    </main>
  );
}
