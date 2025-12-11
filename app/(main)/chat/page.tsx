import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export default async function ChatIndexPage() {
	const session = await getServerSession(authOptions);
	if (!session?.user) redirect("/login");
	return (
		<div className="flex h-full items-center justify-center text-slate-600">
			<div className="text-center">
				<p className="text-sm font-semibold uppercase tracking-wide text-slate-400">
					Welcome
				</p>
				<h2 className="mt-2 text-3xl font-semibold text-slate-900">
					Pick a conversation
				</h2>
				<p className="mt-3 text-sm text-slate-500">
					Select a chat on the left or start a new one.
				</p>
			</div>
		</div>
	);
}
