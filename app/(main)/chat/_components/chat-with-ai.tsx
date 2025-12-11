"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";

type Props = {
	action: () => Promise<string>; // returns conversationId
};

export default function ChatWithAIButton({ action }: Props) {
	const [isPending, startTransition] = useTransition();
	const router = useRouter();

	const handleClick = () => {
		startTransition(async () => {
			const convoId = await action();
			router.push(`/chat/${convoId}`);
		});
	};

	return (
		<button
			type="button"
			onClick={handleClick}
			disabled={isPending}
			className="bg-white w-[95%] rounded-lg py-4 text-sm font-semibold text-slate-900 shadow-sm hover:bg-slate-50 disabled:opacity-60"
		>
			{isPending ? "Opening AI chat..." : "Chat With AI"}
		</button>
	);
}
