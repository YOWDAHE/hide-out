"use client";

import { useActionState } from "react";
import { signIn } from "next-auth/react";
import { useState } from "react";

type FormState = { error?: string };

type Props = {
	mode: "login" | "signup";
	action?: (prevState: FormState, formData: FormData) => Promise<FormState>;
};

export default function AuthForm({ mode, action }: Props) {
	const [serverState, formAction, isPending] = useActionState<
		FormState,
		FormData
	>(
		action ?? (async () => ({ error: undefined })), // initial server action
		{ error: undefined } // initial state
	);

	const [localError, setLocalError] = useState<string | undefined>(undefined);

	const title = mode === "signup" ? "Create an account" : "Welcome back";
	const subtitle =
		mode === "signup"
			? "Sign up with email or Google to get started."
			: "Log in with your credentials or Google.";

	async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
		setLocalError(undefined);

		const formData = new FormData(e.currentTarget);
		const name = (formData.get("name") as string | null) ?? undefined;
		const rawEmail = (formData.get("email") as string | null) ?? "";
		const email = rawEmail.trim().toLowerCase(); // IMPORTANT
		const password = (formData.get("password") as string | null) ?? "";

		if (!email || !password) {
			setLocalError("Email and password are required");
			return;
		}

        if (mode === "signup") {
            
            const result = formAction(formData);

			// 2) Then log in via credentials provider
			await signIn("credentials", {
				name,
				email,
				password,
				redirect: true,
				callbackUrl: "/chat",
			});
		} else {
			// Login mode: just sign in
			const res = await signIn("credentials", {
				email,
				password,
				redirect: true,
				callbackUrl: "/chat",
			});
			if (res?.error) {
				setLocalError("Invalid credentials");
			}
		}
	}

	async function handleGoogle() {
		await signIn("google", { callbackUrl: "/chat" });
	}

	const error = localError || serverState?.error;

	return (
		<main className="flex items-center justify-center px-4">
			<div className="w-full max-w-md rounded-2xl">
				<h1 className="text-2xl font-semibold text-white">{title}</h1>
				<p className="mt-1 text-sm text-white/70">{subtitle}</p>
				<a
					className="mt-4 text-sm text-blue-300"
					href={mode == "login" ? "/signup" : "/login"}
				>
					{mode == "login" ? "Dont have an account" : "Already have an account"}
				</a>

				{error && (
					<div className="mt-4 rounded-md border border-red-500/60 bg-red-500/10 px-3 py-2 text-sm text-red-200">
						{error}
					</div>
				)}

				<form onSubmit={handleSubmit} className="mt-6 space-y-4">
					{mode === "signup" && (
						<div className="space-y-1.5">
							<label
								htmlFor="name"
								className="block text-sm font-medium text-white/70"
							>
								Name
							</label>
							<input
								id="name"
								name="name"
								type="text"
								autoComplete="name"
								className="w-full rounded-lg border bg-white px-3 py-2 text-sm text-black/80 outline-none ring-0 transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/40"
								placeholder="Your name"
								disabled={isPending}
							/>
						</div>
					)}
					<div className="space-y-1.5">
						<label
							htmlFor="email"
							className="block text-sm font-medium text-white/70"
						>
							Email
						</label>
						<input
							id="email"
							name="email"
							type="email"
							autoComplete="email"
							required
							className="w-full rounded-lg border bg-white px-3 py-2 text-sm text-black/80 outline-none ring-0 transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/40"
							placeholder="you@example.com"
							disabled={isPending}
						/>
					</div>

					<div className="space-y-1.5">
						<label
							htmlFor="password"
							className="block text-sm font-medium text-white/70"
						>
							Password
						</label>
						<input
							id="password"
							name="password"
							type="password"
							autoComplete={mode === "signup" ? "new-password" : "current-password"}
							required
							className="w-full rounded-lg border bg-white px-3 py-2 text-sm text-black/80 outline-none ring-0 transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/40"
							placeholder="••••••••"
							disabled={isPending}
						/>
					</div>

					<button
						type="submit"
						disabled={isPending}
						className="mt-2 flex w-full items-center justify-center rounded-lg bg-black px-4 py-2 text-sm font-medium text-white shadow-sm shadow-sky-900/50 transition hover:bg-black/80 disabled:cursor-not-allowed disabled:opacity-60"
					>
						{isPending
							? mode === "signup"
								? "Creating account..."
								: "Logging in..."
							: mode === "signup"
							? "Sign up with email"
							: "Log in with email"}
					</button>
				</form>

				<div className="mt-4 flex items-center gap-2">
					<div className="h-[1px] flex-1 bg-slate-800" />
					<span className="text-xs uppercase tracking-wide text-slate-500">or</span>
					<div className="h-[1px] flex-1 bg-slate-800" />
				</div>

				<button
					type="button"
					onClick={handleGoogle}
					disabled={isPending}
					className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-medium text-slate-100 transition hover:border-sky-500 hover:bg-slate-900/80 disabled:cursor-not-allowed disabled:opacity-60"
				>
					<svg
						aria-hidden="true"
						focusable="false"
						className="h-4 w-4"
						viewBox="0 0 24 24"
					>
						<path
							fill="#EA4335"
							d="M12 10.2v3.7h5.2c-.2 1.2-.9 2.3-1.9 3l3 2.4C20.3 18.1 21 16.2 21 14c0-0.6-.1-1.1-.2-1.6H12z"
						/>
						<path
							fill="#34A853"
							d="M6.7 14.3 5.8 15l-2.4 1.9C4.6 19.9 8 22 12 22c2.7 0 5-.9 6.7-2.4l-3-2.4C14.8 18.1 13.5 18.6 12 18.6c-2.3 0-4.2-1.5-4.9-3.6z"
						/>
						<path
							fill="#4A90E2"
							d="M18.7 19.6 15.7 17.2C16.6 16.5 17.3 15.4 17.5 14.2H12v-3.7h9c.1.5.2 1 .2 1.6 0 2.2-.7 4.1-2.5 5.5z"
						/>
						<path
							fill="#FBBC05"
							d="M5.1 8.8 2.7 6.9C1.6 8.4 1 10.1 1 12c0 1.9.6 3.6 1.7 5l2.4-1.9C4.4 14.9 4.1 13.5 4.1 12c0-1.5.3-2.9 1-4.2z"
						/>
						<path
							fill="#FFFFFF"
							d="M12 5.4c1.4 0 2.6.5 3.5 1.3l2.6-2.6C16.9 2.5 14.7 1.5 12 1.5 8 1.5 4.6 3.6 2.7 6.9l2.4 1.9C7.8 7 9.7 5.4 12 5.4z"
						/>
					</svg>
					<span>Continue with Google</span>
				</button>
			</div>
		</main>
	);
}
