"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const next = useSearchParams().get("next") ?? "/dashboard";

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
    <main style={{ maxWidth: 420, margin: "3rem auto" }}>
      <h1>Create account</h1>
      <form onSubmit={onSubmit}>
        <input name="firstName" placeholder="First name" required />
        <input name="lastName" placeholder="Last name" required />
        <input name="email" type="email" placeholder="Email" required />
        <input name="password" type="password" placeholder="Password" required />
        <button disabled={loading} type="submit">
          {loading ? "Creating..." : "Register"}
        </button>
        {err && <p style={{ color: "crimson" }}>{err}</p>}
      </form>
      <p>
        Already have an account? <a href="/login">Login</a>
      </p>
    </main>
  );
}