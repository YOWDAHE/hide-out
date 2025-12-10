'use client';

import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";

type FormState = { error?: string };
type AuthMode = "login" | "signup";
type AuthAction = (prevState: FormState, formData: FormData) => Promise<FormState>;

const SubmitButton = ({ label }: { label: string }) => {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="relative inline-flex w-full items-center justify-center rounded-xl bg-linear-to-r from-blue-500 to-indigo-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 transition hover:from-blue-400 hover:to-indigo-400 disabled:cursor-not-allowed disabled:opacity-70"
    >
      {pending ? "Working..." : label}
    </button>
  );
};

export default function AuthForm({
  mode,
  action,
}: {
  mode: AuthMode;
  action: AuthAction;
}) {
  const [state, formAction] = useActionState<FormState, FormData>(action, { error: undefined });
  const isSignup = mode === "signup";

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white/80">
          {isSignup ? "Create account" : "Welcome back"}
        </p>
        <h2 className="text-3xl font-semibold text-white">
          {isSignup ? "Join Hide Out" : "Sign in to Hide Out"}
        </h2>
        <p className="text-sm text-white/60">
          {isSignup
            ? "Create an account to start chatting with friends or AI."
            : "Enter your credentials to continue."}
        </p>
      </div>

      <form action={formAction} className="space-y-4">
        {isSignup && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-white/80" htmlFor="name">
              Name
            </label>
            <input
              id="name"
              name="name"
              placeholder="Jane Doe"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-white outline-none ring-2 ring-transparent transition focus:border-white/20 focus:ring-blue-500/40"
            />
          </div>
        )}
        <div className="space-y-2">
          <label className="text-sm font-medium text-white/80" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            placeholder="you@example.com"
            className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-white outline-none ring-2 ring-transparent transition focus:border-white/20 focus:ring-blue-500/40"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-white/80" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={6}
            placeholder="••••••••"
            className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-white outline-none ring-2 ring-transparent transition focus:border-white/20 focus:ring-blue-500/40"
          />
        </div>

        {state?.error && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-100">
            {state.error}
          </div>
        )}

        <SubmitButton label={isSignup ? "Create account" : "Sign in"} />
      </form>

      <p className="text-sm text-white/60">
        {isSignup ? "Already have an account? " : "New here? "}
        <Link
          href={isSignup ? "/login" : "/signup"}
          className="font-semibold text-blue-300 hover:text-blue-200"
        >
          {isSignup ? "Sign in" : "Create one"}
        </Link>
      </p>
    </div>
  );
}

