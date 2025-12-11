"use client";

import { useEffect, useRef } from "react";

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
};

export default function MessagesList({
	messages,
	currentUserId,
}: MessagesListProps) {
	const messagesEndRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages]);

	if (messages.length === 0) {
		return (
			<div className="flex-1 flex items-center justify-center bg-slate-50">
				<div className="text-center">
					<p className="text-sm font-medium text-slate-500">No messages yet</p>
					<p className="text-xs text-slate-400 mt-1">
						Start the conversation by sending a message
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className="flex-1 overflow-y-auto bg-slate-50 px-4 pb-20 flex items-end w-full">
			<div className="space-y-4 max-w-3xl mx-auto w-full">
				{messages.map((msg, idx) => {
					const fromMe = msg.senderId === currentUserId;
					const isAI = msg.isAIMessage;
					const showAvatar = !fromMe;
					const prevMsg = idx > 0 ? messages[idx - 1] : null;
					const showTimestamp =
						!prevMsg ||
						new Date(msg.createdAt).getTime() -
							new Date(prevMsg.createdAt).getTime() >
							5 * 60 * 1000; // 5 minutes

					return (
						<div key={msg.id} className="flex gap-3 group">
							{showAvatar && (
								<div className="shrink-0">
									<div
										className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold ${
											isAI
												? "bg-purple-100 text-purple-700"
												: "bg-slate-200 text-slate-700"
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
									className={`rounded-2xl px-4 py-2.5 max-w-[60%] shadow-sm ${
										isAI
											? "bg-purple-100 text-purple-900 border border-purple-200"
											: fromMe
											? "bg-blue-500 text-white"
											: "bg-white text-slate-900 border border-slate-200"
									}`}
								>
									<p className="text-sm leading-relaxed whitespace-pre-wrap wrap-break-word">
										{msg.content}
									</p>
								</div>
								{showTimestamp && (
									<span className="text-[10px] text-slate-400 px-2">
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

