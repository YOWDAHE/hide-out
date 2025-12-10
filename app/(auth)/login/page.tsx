import { redirect } from "next/navigation";

import AuthForm from "../_components/auth-form";
import { currentUser, login } from "@/app/actions/auth";

type FormState = { error?: string };

async function loginAction(prevState: FormState, formData: FormData): Promise<FormState> {
  "use server";

  try {
    const email = (formData.get("email") as string | null) ?? "";
    const password = (formData.get("password") as string | null) ?? "";
    await login({ email, password });
    redirect("/chat");
  } catch (err) {
    const message = err instanceof Error ? err.message : "Something went wrong";
    return { error: message };
  }

  return { error: undefined };
}

export default async function LoginPage() {
  const user = await currentUser();
  if (user) redirect("/chat");

  return <AuthForm mode="login" action={loginAction} />;
}

