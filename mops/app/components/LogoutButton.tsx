"use client";

export function LogoutButton() {
  return (
    <button
      type="submit"
      className="px-4 py-2 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition-all duration-200 shadow-md hover:shadow-lg"
    >
      Logout
    </button>
  );
}