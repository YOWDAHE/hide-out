// app/chat/[conversationId]/_components/conversation-shell.tsx
"use client";

import { useState, useEffect } from "react";
import MessagesList from "./messages-list";
import MessageComposer from "./message-composer";
import { useRouter } from "next/navigation";

type Message = {
	id: string;
	content: string;
	senderId: string | null;
	isAIMessage: boolean;
	createdAt: Date;
};

type FormState = { error?: string; ok?: boolean; message?: Message };

type SendAction = (prev: FormState, formData: FormData) => Promise<FormState>;

export default function ConversationShell({
	initialMessages,
	conversationId,
	currentUserId,
	action,
}: {
	initialMessages: Message[];
	conversationId: string;
	currentUserId: string;
	action: SendAction;
}) {
    const [messages, setMessages] = useState<Message[]>(initialMessages);
    const router = useRouter();

	// Sync when server re-renders
	useEffect(() => {
		setMessages(initialMessages);
	}, [initialMessages]);

	const addOptimisticMessage = (content: string) => {
		const tempMessage: Message = {
			id: `temp-${Date.now()}`,
			senderId: currentUserId,
			content,
			isAIMessage: false,
			createdAt: new Date(),
		};
        setMessages((prev) => [...prev, tempMessage]);
        router.refresh()
        console.log("The messages: ",messages)
	};

	const replaceTempWithReal = (tempId: string, real: Message) => {
		// setMessages((prev) => prev.map((m) => (m.id === tempId ? real : m)));
	};

	return (
		<>
			<MessagesList
				messages={messages}
				currentUserId={currentUserId}
				conversationId={conversationId}
			/>
			<div className="border-slate-200 bg-white relative w-full flex items-center justify-center">
				<MessageComposer
					conversationId={conversationId}
					action={action}
					onDelivered={replaceTempWithReal}
					onOptimisticMessage={addOptimisticMessage}
				/>
			</div>
		</>
	);
}
