"use client";
import { usePresenceSocket } from "@/app/hooks/usePresenceSocket";
import React from "react";
import {
	PresenceProvider,
	usePresence,
} from "@/app/components/presence-provider";

type userListProp = {
	conversationId: string;
	otherId?: string;
	name: string | null;
	email: string | null;
	time: string;
	snippet: string;
};

function UserList(props: userListProp) {
	const { onlineSet } = usePresence();
	const online =
        props.otherId && props.otherId !== "" ? onlineSet.has(props.otherId) : false;
    
	if (props.otherId && props.otherId != "") {
		const online = onlineSet.has(props.otherId);
		console.log(online);
	}
	return (
		<a
			key={props.conversationId}
			href={`/chat/${props.conversationId}`}
			className="flex items-center gap-3 px-1 py-3 transition hover:border-blue-400/40 hover:bg-blue-50/40"
		>
			<div className="relative flex h-11 w-11 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-700">
				{props.name?.[0]?.toUpperCase() || "C"}
				{props.otherId && (
					<span
						className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white ${
							online ? "bg-green-500" : "bg-gray-400"
						}`}
					/>
				)}
			</div>
			<div className="flex-1">
				<div className="flex items-center justify-between">
					<p className="text-sm font-semibold text-slate-900">
						{props.name || props.email}
					</p>
					<span className="text-[10px] uppercase text-slate-400">{props.time}</span>
				</div>
				<p className="truncate text-xs text-slate-500 w-40">{props.snippet}</p>
			</div>
		</a>
	);
}

export default UserList;
