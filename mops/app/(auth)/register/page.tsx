"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const next = useSearchParams().get("next") ?? "/";

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const payload = Object.fromEntries(fd.entries());
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setLoading(false);
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setErr(j.error ?? "Registration failed");
      return;
    }
    router.push(next);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-green-100">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-green-900 mb-2">Safe City</h1>
            <h2 className="text-2xl font-bold text-gray-800">Create account</h2>
            <p className="text-gray-600 mt-2">Join Safe City to report incidents</p>
          </div>

          <form className="space-y-4" onSubmit={onSubmit}>
            <div>
              <label htmlFor="firstName" className="block text-sm font-semibold text-gray-800 mb-2">
                First Name
              </label>
              <input
                id="firstName"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900 placeholder-gray-500 transition-colors"
                name="firstName"
                type="text"
                placeholder="John"
                required
              />
            </div>

            <div>
              <label htmlFor="lastName" className="block text-sm font-semibold text-gray-800 mb-2">
                Last Name
              </label>
              <input
                id="lastName"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900 placeholder-gray-500 transition-colors"
                name="lastName"
                type="text"
                placeholder="Doe"
                required
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-800 mb-2">
                Email
              </label>
              <input
                id="email"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900 placeholder-gray-500 transition-colors"
                name="email"
                type="email"
                placeholder="your@email.com"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-800 mb-2">
                Password
              </label>
              <input
                id="password"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900 placeholder-gray-500 transition-colors"
                name="password"
                type="password"
                placeholder="••••••••"
                required
              />
            </div>

            {err && (
              <div className="p-4 bg-red-50 border-2 border-red-400 rounded-xl">
                <p className="text-sm text-red-800">{err}</p>
              </div>
            )}

            <button
              className="w-full py-4 px-6 bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold rounded-xl hover:from-green-700 hover:to-green-800 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-green-300 shadow-lg hover:shadow-xl"
              disabled={loading}
              type="submit"
            >
              {loading ? "Creating..." : "Register"}
            </button>
          </form>

          <p className="text-center text-sm text-gray-600 mt-6">
            Already have an account?{" "}
            <Link href="/login" className="text-green-700 font-semibold hover:text-green-900 underline">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
