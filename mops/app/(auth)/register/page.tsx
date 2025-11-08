"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import util from "@/app/styles/util.module.css";
import auth from "@/app/styles/auth.module.css";
import forms from "@/app/styles/forms.module.css";
import btn from "@/app/styles/button.module.css";

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
    <div className={util.center}>
      <div className={auth.card}>
        <h1 className={auth.title}>Create account</h1>
        <form className={forms.form} onSubmit={onSubmit}>
          <input className={forms.input} name="firstName" placeholder="First name" required />
          <input className={forms.input} name="lastName" placeholder="Last name" required />
          <input className={forms.input} name="email" type="email" placeholder="Email" required />
          <input className={forms.input} name="password" type="password" placeholder="Password" required />
          <button className={`${btn.btn} ${btn.primary}`} disabled={loading} type="submit">
            {loading ? "Creating..." : "Register"}
          </button>
          {err && <p className={forms.error}>{err}</p>}
        </form>
        <p className={`${util.muted} ${auth.footer}`}>
          Already have an account? <a href="/login">Login</a>
        </p>
      </div>
    </div>
  );
}
