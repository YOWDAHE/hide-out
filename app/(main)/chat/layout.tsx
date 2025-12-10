import { ReactNode } from "react";
import { redirect } from "next/navigation";

import prisma from "@/lib/prisma";
import { currentUser, logout } from "@/app/actions/auth";
import {
	createAIConversation,
	createDirectConversation,
	searchUsersByName,
} from "@/app/actions/conversations";
import SidebarSearch from "./_components/sidebar-search";

type LayoutProps = {
	children: ReactNode;
};

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

async function searchUsersAction(
	prevState: SearchState,
	formData: FormData,
): Promise<SearchState> {
	"use server";
	const q = (formData.get("q") as string | null)?.trim() ?? "";
	if (!q) return { q: "", results: [] };
	try {
		const results = await searchUsersByName(q);
		return { q, results };
	} catch (err) {
		return {
			q,
			results: [],
			error: err instanceof Error ? err.message : "Search failed",
		};
	}
}

export default async function ChatLayout({ children }: LayoutProps) {
	const me = await currentUser();
	if (!me) redirect("/login");

	const conversations = await prisma.conversation.findMany({
		where: { participants: { some: { userId: me.id } } },
		include: {
			participants: {
				include: {
					user: { select: { id: true, name: true, email: true, image: true } },
				},
			},
			messages: { orderBy: { createdAt: "desc" }, take: 1 },
		},
		orderBy: { updatedAt: "desc" },
	});

	async function startConversation(formData: FormData) {
		"use server";
		const partnerId = formData.get("partnerId") as string | null;
		if (!partnerId) throw new Error("Missing partner");
		const convo = await createDirectConversation(partnerId);
		redirect(`/chat/${convo.id}`);
	}

	async function startAIConversation() {
		"use server";
		const convo = await createAIConversation();
		redirect(`/chat/${convo.id}`);
	}

	const timeFmt = new Intl.DateTimeFormat("en", {
		hour: "numeric",
		minute: "2-digit",
	});

	return (
		<div className="min-h-screen bg-[#f5f7fb] text-slate-900">
			<div className="mx-auto flex h-screen max-w-6xl gap-3 px-4 py-6">
				<aside className="flex w-80 flex-col gap-4 rounded-xl border border-slate-200 bg-white p-2 shadow-xl shadow-slate-200/70">
					<div className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2">
						<div>
							<p className="text-sm font-semibold text-slate-900">Chats</p>
							<p className="text-xs text-slate-500">Find people or start new</p>
						</div>
						<details className="relative group">
							<summary className="flex cursor-pointer items-center gap-2 rounded-xl px-2 py-1 text-sm font-semibold text-slate-900 hover:border-blue-300 focus:outline-none">
								<div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-700">
									{me.name?.[0]?.toUpperCase() || me.email[0]?.toUpperCase()}
								</div>
								<span className="text-slate-400">▾</span>
							</summary>
							<div className="absolute right-0 mt-2 w-56 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg shadow-slate-200/80">
								<div className="flex items-center gap-3 px-4 py-3">
									<div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-700">
										{me.name?.[0]?.toUpperCase() || me.email[0]?.toUpperCase()}
									</div>
									<div className="leading-tight">
										<p className="text-sm font-semibold text-slate-900">
											{me.name || "Account"}
										</p>
										<p className="truncate text-xs text-slate-500">{me.email}</p>
									</div>
								</div>
								<div className="border-t border-slate-200">
									<form action={logout}>
										<button
											type="submit"
											className="flex w-full items-center gap-2 px-4 py-3 text-sm font-semibold text-red-500 hover:bg-slate-50"
										>
											<span>⎋</span>
											<span>Log out</span>
										</button>
									</form>
								</div>
							</div>
						</details>
					</div>

					<SidebarSearch action={searchUsersAction} startConversationAction={startConversation} />

					{/* <form action={startAIConversation}>
							<button
								type="submit"
								className="w-full rounded-2xl bg-linear-to-r from-blue-500 to-indigo-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 transition hover:from-blue-400 hover:to-indigo-400"
							>
								Start AI chat
							</button>
						</form> */}

					<div className="space-y-3 overflow-y-auto px-1">
						<p className="text-xs font-semibold uppercase text-slate-500">Chats</p>
						<div className="space-y-2">
							{conversations.length === 0 && (
								<p className="text-sm text-slate-500">No conversations yet</p>
							)}
							{conversations.map((convo) => {
								const other =
									convo.type === "AI"
										? { name: "AI Assistant", email: "ai@hideout" }
										: convo.participants
												.map((p) => p.user)
												.find((u) => u.id !== me.id) || { name: "Direct chat", email: "" };
								const last = convo.messages?.[0];
								const snippet =
									last?.content ??
									(convo.type === "AI" ? "Chat with AI" : "Direct conversation");
								const timeLabel = last?.createdAt ? timeFmt.format(last.createdAt) : "";
								return (
									<a
										key={convo.id}
										href={`/chat/${convo.id}`}
										className="flex items-center gap-3 px-1 py-3 transition hover:border-blue-400/40 hover:bg-blue-50/40"
									>
										<div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-700">
											{other.name?.[0]?.toUpperCase() || "C"}
										</div>
										<div className="flex-1">
											<div className="flex items-center justify-between">
												<p className="text-sm font-semibold text-slate-900">
													{other.name || other.email}
												</p>
												<span className="text-[10px] uppercase text-slate-400">
													{timeLabel}
												</span>
											</div>
											<p className="truncate text-xs text-slate-500">{snippet}</p>
										</div>
									</a>
								);
							})}
						</div>
					</div>
				</aside>

				<main className="flex-1 overflow-hidden rounded-xl border border-slate-200 bg-white p-2 shadow-xl shadow-slate-200/70">
					{children}
				</main>
			</div>
		</div>
	);
}
