// app/(auth)/login/page.tsx
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import AuthForm from "../_components/auth-form";
import { signupWithEmail } from "@/app/actions/auth";

type FormState = { error?: string };

async function signupAction(
	prevState: FormState,
	formData: FormData
): Promise<FormState> {
	"use server";

	try {
		const email = (formData.get("email") as string | null) ?? "";
		const password = (formData.get("password") as string | null) ?? "";
		await signupWithEmail({ email, password });
		return { error: undefined };
	} catch (err) {
		const message = err instanceof Error ? err.message : "Something went wrong";
		return { error: message };
	}
}

export default async function LoginPage() {
	const session = await getServerSession(authOptions);
	if (session?.user) redirect("/chat");

	return <AuthForm mode="signup" action={signupAction} />;
}
