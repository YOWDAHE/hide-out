import { redirect } from "next/navigation";

import AuthForm from "../_components/auth-form";
import { currentUser, signup } from "@/app/actions/auth";

type FormState = { error?: string };

async function signupAction(prevState: FormState, formData: FormData): Promise<FormState> {
  "use server";

  try {
    const email = (formData.get("email") as string | null) ?? "";
    const password = (formData.get("password") as string | null) ?? "";
    const name = (formData.get("name") as string | null) ?? undefined;
    await signup({ email, password, name: name || undefined });
    redirect("/chat");
  } catch (err) {
    const message = err instanceof Error ? err.message : "Something went wrong";
    return { error: message };
  }

  return { error: undefined };
}

export default async function SignupPage() {
  const user = await currentUser();
  if (user) redirect("/chat");

  return <AuthForm mode="signup" action={signupAction} />;
}

