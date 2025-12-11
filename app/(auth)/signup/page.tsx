// app/(auth)/signup/page.tsx
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import AuthForm from "../_components/auth-form";
import { signupWithEmail } from "@/app/actions/auth";

type FormState = { error?: string; user?: { id: string; email: string } };

async function signupAction(
	prevState: FormState,
	formData: FormData
): Promise<FormState> {
	"use server";

	try {
		const email = (formData.get("email") as string | null) ?? "";
		const password = (formData.get("password") as string | null) ?? "";
		const name = (formData.get("name") as string | null) ?? undefined;

		if (!email || !password) {
			return { error: "Email and password are required" };
		}

    const user = await signupWithEmail({ email, password, name: name || undefined });
    setTimeout(() => console.log("nope"), 1000);

		 return { error: undefined, user: { id: user.id, email: user.email } };
	} catch (err) {
		const message = err instanceof Error ? err.message : "Something went wrong";
		return { error: message };
	}
}

export default async function SignupPage() {
	const session = await getServerSession(authOptions);
	if (session?.user) redirect("/chat");

	return <AuthForm mode="signup" action={signupAction} />;
}
