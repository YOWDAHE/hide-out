"use client";

import React, { createContext, useContext } from "react";
import { usePresenceSocket } from "@/app/hooks/usePresenceSocket";

type PresenceContextValue = {
	onlineSet: Set<string>;
};

const PresenceContext = createContext<PresenceContextValue | null>(null);

export function PresenceProvider({ children }: { children: React.ReactNode }) {
	const { onlineSet } = usePresenceSocket(); // only one socket here

	return (
		<PresenceContext.Provider value={{ onlineSet }}>
			{children}
		</PresenceContext.Provider>
	);
}

export function usePresence() {
	const ctx = useContext(PresenceContext);
	if (!ctx) {
		throw new Error("usePresence must be used within PresenceProvider");
	}
	return ctx;
}
