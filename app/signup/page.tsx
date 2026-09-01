"use client";

import { SubmitEvent, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function SignUpPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const supabase = createClient();

async function handleSignUp(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    setMessage("");

    if (password !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    if (data.user) {
      setMessage("Account created. Check your email to confirm your account.");
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#111111] px-6 text-white">
      <div className="w-full max-w-md rounded-2xl border border-neutral-800 bg-neutral-900 p-8 shadow-2xl">
        <div className="mb-8">
          <p className="mb-2 text-xs uppercase tracking-[0.25em] text-neutral-500">
            Tone Finder
          </p>

          <h1 className="text-3xl font-semibold">
            Create account
          </h1>

          <p className="mt-2 text-sm text-neutral-400">
            Save your rig, tone settings, and future tone matches.
          </p>
        </div>

        <form onSubmit={handleSignUp} className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-neutral-300">
              Email
            </label>

            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-4 py-3 outline-none transition focus:border-neutral-500"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-neutral-300">
              Password
            </label>

            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              minLength={6}
              className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-4 py-3 outline-none transition focus:border-neutral-500"
              placeholder="Enter a password"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-neutral-300">
              Confirm password
            </label>

            <input
              type="password"
              value={confirmPassword}
              onChange={(event) =>
                setConfirmPassword(event.target.value)
              }
              required
              minLength={6}
              className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-4 py-3 outline-none transition focus:border-neutral-500"
              placeholder="Enter it again"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-white px-4 py-3 font-semibold text-black transition hover:bg-neutral-200 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Creating account..." : "Create account"}
          </button>

          {message && (
            <p className="text-sm text-neutral-300">
              {message}
            </p>
          )}
        </form>
      </div>
    </main>
  );
}