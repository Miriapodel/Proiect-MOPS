"use client";

import { useState } from "react";
import Link from "next/link";

export default function RequestResetPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const fd = new FormData(e.currentTarget);
    const payload = Object.fromEntries(fd.entries());

    try {
      const res = await fetch("/api/auth/request-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Failed to send reset email");
        setLoading(false);
        return;
      }

      setSuccess(true);
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-green-100">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-green-900 mb-2">Safe City</h1>
              <h2 className="text-2xl font-bold text-gray-800">Check Your Email</h2>
            </div>

            <div className="p-4 bg-green-50 border-2 border-green-400 rounded-xl mb-6">
              <p className="text-sm text-green-800">
                If an account exists with that email, we've sent password reset instructions.
                Please check your inbox.
              </p>
            </div>

            <div className="text-center text-sm text-gray-600">
              <p className="mb-4">Didn&apos;t receive an email? Check your spam folder.</p>
              <Link
                href="/login"
                className="text-green-700 font-semibold hover:text-green-900 underline"
              >
                Back to Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-green-100">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-green-900 mb-2">Safe City</h1>
            <h2 className="text-2xl font-bold text-gray-800">Reset Password</h2>
            <p className="text-gray-600 mt-2">
              Enter your email to receive reset instructions
            </p>
          </div>

          <form className="space-y-4" onSubmit={onSubmit}>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-semibold text-gray-800 mb-2"
              >
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

            {error && (
              <div className="p-4 bg-red-50 border-2 border-red-400 rounded-xl">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            <button
              className="w-full py-4 px-6 bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold rounded-xl hover:from-green-700 hover:to-green-800 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-green-300 shadow-lg hover:shadow-xl"
              disabled={loading}
              type="submit"
            >
              {loading ? "Sending..." : "Send Reset Link"}
            </button>
          </form>

          <p className="text-center text-sm text-gray-600 mt-6">
            Remember your password?{" "}
            <Link
              href="/login"
              className="text-green-700 font-semibold hover:text-green-900 underline"
            >
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
