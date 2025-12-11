"use client";

import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

type PresenceUpdate = { userId: string; online: boolean };

export function usePresenceSocket() {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [onlineSet, setOnlineSet] = useState<Set<string>>(new Set());

    useEffect(() => {
        let active = true;

        async function connect() {
            try {
                const res = await fetch("/api/socket-token");
                if (!res.ok) return;
                const { token } = await res.json();

                console.log("EVN: ", process.env.NEXT_PUBLIC_SOCKET_URL)
                const s = io(process.env.NEXT_PUBLIC_SOCKET_URL!, {
                    auth: { token },
                });

                s.on("connect", () => {
                    console.log("socket connected");
                });

                s.on("presence:update", ({ userId, online }: PresenceUpdate) => {
                    console.log("Users :", userId, online)
                    setOnlineSet((prev) => {
                        const next = new Set(prev);
                        if (online) next.add(userId);
                        else next.delete(userId);
                        return next;
                    });
                });

                if (!active) {
                    s.disconnect();
                    return;
                }

                setSocket(s);
            } catch (e) {
                console.error(e);
            }
        }

        connect();

        return () => {
            active = false;
            if (socket) socket.disconnect();
        };
    }, []);

    return { socket, onlineSet };
}
