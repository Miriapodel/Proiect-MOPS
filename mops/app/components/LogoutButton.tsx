"use client";
import { useRouter } from "next/navigation";

export function LogoutButton() {
  const router = useRouter();
  return (
    <button
      onClick={async () => {
        await fetch("/api/auth/logout", { method: "POST" });
        router.push("/login");
      }}
      type="button"
      className="px-6 py-3 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition-all duration-200 shadow-md hover:shadow-lg"
    >
      Logout
    </button>
  );
}