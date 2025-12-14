import Link from "next/link";
import { getCurrentUser } from "@/lib/currentUser";
import SearchBar from "./SearchBar";
import { LogoutButton } from "./LogoutButton";

export default async function NavBar() {
  const currentUser = await getCurrentUser();
  const isAuthed = !!currentUser;

  return (
    <header className="border-b border-green-100 bg-white/80 backdrop-blur">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-xl font-bold text-green-800">
            Safe City
          </Link>

          {isAuthed && (
            <nav className="hidden sm:flex items-center gap-3 text-sm text-gray-700">
              <Link href="/incidents" className="hover:text-green-800">
                Incidents
              </Link>
              <Link href="/incidents/mine" className="hover:text-green-800">
                My Incidents
              </Link>
              <Link href="/map" className="hover:text-green-800">
                Map
              </Link>
              <Link href="/report" className="hover:text-green-800">
                Report
              </Link>

              {currentUser?.role === "ADMIN" && (
                <Link href="/admin/dashboard" className="hover:text-green-800">
                  Admin
                </Link>
              )}
            </nav>
          )}
        </div>

        {isAuthed && <SearchBar />}

        <div className="flex items-center gap-3 text-sm">
          {isAuthed && (
            <span className="hidden sm:inline text-gray-600">
              {currentUser!.firstName} {currentUser!.lastName}
            </span>
          )}

          {isAuthed ? (
            <form action="/api/auth/logout" method="post">
              <LogoutButton />
            </form>
          ) : (
            <div className="flex gap-2">
              <Link
                href="/login"
                className="px-4 py-2 rounded-lg border border-green-200 text-green-800 hover:bg-green-50"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="px-4 py-2 rounded-lg bg-green-700 text-white hover:bg-green-800"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}