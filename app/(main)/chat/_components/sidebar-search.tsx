"use client";

import { Search } from "lucide-react";
import { useActionState, useState } from "react";

type SearchState = {
	q: string;
	results: {
		id: string;
		name: string | null;
		email: string;
		image?: string | null;
	}[];
	error?: string;
};

type SearchAction = (
	prev: SearchState,
	formData: FormData
) => Promise<SearchState>;

type StartConversationAction = (formData: FormData) => Promise<void>;

export default function SidebarSearch({
	initialQ = "",
	action,
	startConversationAction,
}: {
	initialQ?: string;
	action: SearchAction;
	startConversationAction: StartConversationAction;
}) {
	const [q, setQ] = useState(initialQ);
	const [state, formAction] = useActionState(action, {
		q: initialQ,
		results: [],
	});

	const handleStartConversation = async (partnerId: string) => {
		const formData = new FormData();
		formData.append("partnerId", partnerId);
		await startConversationAction(formData);
	};

	return (
		<div className="space-y-2">
			<form action={formAction}>
				<div className="flex items-center gap-2 rounded-full border border-white bg-white/90 px-3 py-2">
					<input
						id="q"
						name="q"
						value={q}
						onChange={(e) => setQ(e.target.value)}
						placeholder="Search user"
						className="w-full bg-transparent px-2 text-sm text-slate-900 outline-none placeholder:text-slate-400"
					/>
					<button
						type="submit"
						className="rounded-full bg-blue-500 px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-blue-400"
					>
						<Search size={16} />
					</button>
				</div>
			</form>
			{state?.error && <p className="px-3 text-xs text-red-500">{state.error}</p>}
			{state?.results?.length ? (
				<div className="space-y-2 rounded-xl border border-slate-200 bg-white px-3 py-2">
					{state.results.map((user) => (
						<button
							key={user.id}
							type="button"
							onClick={() => handleStartConversation(user.id)}
							className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm text-slate-800 transition hover:bg-slate-50"
						>
							<div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-700">
								{user.name?.[0]?.toUpperCase() || user.email[0]?.toUpperCase()}
							</div>
							<div className="flex-1 leading-tight">
								<p className="font-semibold">{user.name || user.email}</p>
								<p className="text-[11px] text-slate-500">{user.email}</p>
							</div>
						</button>
					))}
				</div>
			) : null}
		</div>
	);
}
