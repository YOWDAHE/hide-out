"use client";

import { useEffect, useRef, useState } from "react";

type Message = {
	id: string;
	content: string;
	senderId: string | null;
	isAIMessage: boolean;
	createdAt: Date;
};

type MessagesListProps = {
	messages: Message[];
	currentUserId: string;
	conversationId: string;
	// onDelivered: (tempId: string, real: any) => void;
};

export default function MessagesList({
	messages,
	currentUserId,
}: MessagesListProps) {
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [localMessages, setLocalMessages] = useState<Message[]>(messages);

	useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        setLocalMessages(messages);
	}, [messages]);

	if (messages.length === 0) {
		return (
			<div className="flex-1 flex items-center justify-center">
				<div className="text-center bg-white/60 p-6 rounded-md">
					<p className="text-lg font-medium text-black">No messages yet</p>
					<p className="text-xs text-slate-800 mt-1">
						Start the conversation by sending a message
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className="flex-1 overflow-y-auto px-4 pb-20 flex items-end w-full">
			<div className="max-w-3xl mx-auto w-full">
				{messages.map((msg, idx) => {
					const fromMe = msg.senderId === currentUserId;
					const isAI = msg.isAIMessage;
					const showAvatar = !fromMe;
                    const prevMsg = idx > 0 ? messages[idx - 1] : null;
                    const nextMsg = messages.length > idx ? messages[idx+1] : null
					const showTimestamp =
						!nextMsg ||
						new Date(nextMsg.createdAt).getTime() -
							new Date(msg.createdAt).getTime() >
							5 * 60 * 1000; // 5 minutes

					return (
						<div
							key={msg.id}
							className={`flex gap-3 group ${showTimestamp ? "mb-3 mt-1" : "mt-1"}`}
						>
							{showAvatar && (
								<div className="shrink-0">
									<div
										className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold ${
											isAI ? "bg-purple-100 text-purple-700" : "bg-white text-slate-700"
										}`}
									>
										{isAI ? "AI" : "U"}
									</div>
								</div>
							)}
							{!showAvatar && <div className="w-8" />}
							<div
								className={`flex flex-col gap-1 w-full ${
									fromMe ? "items-end" : "items-start"
								}`}
							>
								<div
									className={` ${
										showTimestamp ? "rounded-t-2xl rounded-bl-2xl " : "rounded-2xl "
									} px-6 py-2 max-w-[60%] shadow-sm ${
										isAI
											? "bg-purple-100 text-purple-900 border border-purple-200"
											: fromMe
											? "bg-[#E1FEC6] text-black"
											: "bg-white text-slate-900 border border-slate-200"
									}`}
								>
									<p className="text-sm leading-relaxed whitespace-pre-wrap wrap-break-word">
										{msg.content}
									</p>
								</div>
								{showTimestamp && (
									<span className="text-[10px] font-semibold text-white px-2">
										{new Date(msg.createdAt).toLocaleTimeString([], {
											hour: "2-digit",
											minute: "2-digit",
										})}
									</span>
								)}
							</div>
						</div>
					);
				})}
				<div ref={messagesEndRef} />
			</div>
		</div>
	);
}

