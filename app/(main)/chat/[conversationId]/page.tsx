import { redirect, notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { currentUser } from "@/app/actions/auth";
import { sendMessage } from "@/app/actions/messages";
import MessageComposer from "../_components/message-composer";
import MessagesList from "../_components/messages-list";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { revalidatePath } from "next/cache";

type PageProps = { params: Promise<{ conversationId: string }> };

export default async function ConversationPage({ params }: PageProps) {
	const { conversationId } = await params;
	const me = await currentUser();
	if (!me) redirect("/login");

	const conversation = await prisma.conversation.findUnique({
		where: { id: conversationId },
		include: {
			participants: {
				include: { user: { select: { id: true, name: true, email: true } } },
			},
			messages: { orderBy: { createdAt: "asc" } },
		},
	});

	if (!conversation) return notFound();

	const isParticipant = conversation.participants.some(
		(p) => p.userId === me.id
	);
	if (!isParticipant) redirect("/chat");

	const otherUser =
		conversation.type === "AI"
			? { name: "AI Assistant", email: "ai@hideout", id: "ai" }
			: conversation.participants
					.map((p) => p.user)
					.find((u) => u.id !== me.id) || {
					name: "Unknown",
					email: "",
					id: "",
			  };

	const title = otherUser.name || "Direct chat";

	async function sendAction(
		prev: { error?: string; ok?: boolean },
		formData: FormData
	) {
		"use server";
		try {
			const content = (formData.get("content") as string | null) ?? "";
			if (!content.trim()) return prev;

			const newMessage = await sendMessage(conversationId, content);

			revalidatePath(`/chat/${conversationId}`);

			return {
				ok: true,
				message: {
					id: newMessage.id,
					conversationId: newMessage.conversationId,
					senderId: newMessage.senderId,
					content: newMessage.content,
					isAIMessage: newMessage.isAIMessage,
					createdAt: newMessage.createdAt,
				},
			};
		} catch (err) {
			return { error: err instanceof Error ? err.message : "Failed to send" };
		}
	}

  return (
			<div className="h-full relative overflow-clip">
				<div className=" relative flex h-full flex-col z-20 bg-white/20">
					<header className="flex items-center justify-between border-b border-slate-200 bg-white/80 backdrop-blur-2xl px-4 py-3 rounded-b-sm">
						<div className="flex items-center gap-3">
							<Link
								href="/chat"
								className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-slate-100 transition"
							>
								<ArrowLeft className="h-5 w-5 text-slate-600" />
							</Link>
							<div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-700">
								{title[0]?.toUpperCase() || "?"}
							</div>
							<div>
								<p className="text-sm font-semibold text-slate-900">{title}</p>
								<p className="text-xs text-slate-500">
									{conversation.type === "AI" ? "AI Assistant" : otherUser.email}
								</p>
							</div>
						</div>
					</header>

					<MessagesList
						messages={conversation.messages}
						currentUserId={me.id}
						conversationId={conversation.id}
					/>

					<div className="border-slate-200 bg-white relative w-full flex items-center justify-center">
						<MessageComposer conversationId={conversation.id} action={sendAction} />
					</div>
				</div>

				{/* <div className="z-0 bg-[url('/telegramColorPattern.png')] absolute inset-0 bg-cover bg-center blur-xs"></div>
				<div className="z-0 bg-[url('/telegramPattern.png')] absolute inset-0 bg-contain bg-center opacity-20"></div> */}
			</div>
		);
}
