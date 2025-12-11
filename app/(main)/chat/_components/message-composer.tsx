"use client";

import { Send } from "lucide-react";
import { useActionState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

type FormState = { error?: string; ok?: boolean; message?: any };
type SendAction = (prev: FormState, formData: FormData) => Promise<FormState>;

export default function MessageComposer({
	conversationId,
	action,
}: {
	conversationId: string;
	action: SendAction;
}) {
	const [state, formAction] = useActionState<FormState, FormData>(action, {
		error: undefined,
		ok: false,
	});
	const inputRef = useRef<HTMLTextAreaElement>(null);
	const router = useRouter();

	useEffect(() => {
		if (state?.ok && inputRef.current) {
			inputRef.current.value = "";
			inputRef.current.focus();
			// Refresh the page data to show the new message immediately
			router.refresh();
		}
	}, [state?.ok, router]);

	return (
		<div className="space-y-2 absolute bottom-5 w-[95%]">
			<form action={formAction} className="flex items-end gap-2">
				<input type="hidden" name="conversationId" value={conversationId} />
				<div className="flex-1 rounded-full border border-slate-200 bg-white/50 backdrop-blur-lg p-2 flex items-end gap-2 shadow-sm">
					<textarea
						ref={inputRef}
						name="content"
						required
						rows={1}
						placeholder="Type your message..."
						className="flex-1 resize-none bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400 px-2 py-2 max-h-32 overflow-y-auto"
						disabled={state?.ok === true}
						onKeyDown={(e) => {
							if (e.key === "Enter" && !e.shiftKey) {
								e.preventDefault();
								e.currentTarget.form?.requestSubmit();
							}
						}}
					/>
					<button
						type="submit"
						disabled={state?.ok === true}
						className="flex h-9 w-9 items-center justify-center rounded-full bg-linear-to-r from-blue-500 to-indigo-500 text-white shadow-sm transition hover:from-blue-400 hover:to-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
					>
						<Send className="h-4 w-4" />
					</button>
				</div>
			</form>
			{state?.error && <p className="text-xs text-red-500 px-2">{state.error}</p>}
		</div>
	);
}
