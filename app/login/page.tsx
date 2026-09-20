"use client";

import { SubmitEvent, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const supabase = createClient();
  const router = useRouter();

  async function handleLogin(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    setMessage("");
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    router.push("/");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f5f1e7] px-6 text-[#303b2d]">
      <div className="w-full max-w-md rounded-2xl border border-[#cdd5c2] bg-[#f8f5ec] p-8 shadow-sm">
        <div className="mb-8">
          <p className="mb-2 text-xs uppercase tracking-[0.25em] text-[#58704e]">
            Tone Finder
          </p>

          <h1 className="text-3xl font-semibold">
            Log in
          </h1>

          <p className="mt-2 text-sm text-[#606b58]">
            Access your saved rigs and tone settings.
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-[#303b2d]">
              Email
            </label>

            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              className="w-full rounded-lg border border-[#cdd5c2] bg-[#e5ebdc] px-4 py-3 text-[#303b2d] outline-none transition placeholder:text-[#87927e] focus:border-[#58704e]"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-[#303b2d]">
              Password
            </label>

            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              className="w-full rounded-lg border border-[#cdd5c2] bg-[#e5ebdc] px-4 py-3 text-[#303b2d] outline-none transition placeholder:text-[#87927e] focus:border-[#58704e]"
              placeholder="Enter your password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-[#d4dfc6] px-4 py-3 font-semibold text-[#303b2d] transition hover:bg-[#c3d2b3] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Log in"}
          </button>

          {message && (
            <p className="text-sm text-[#58704e]">
              {message}
            </p>
          )}
        </form>
      </div>
    </main>
  );
}