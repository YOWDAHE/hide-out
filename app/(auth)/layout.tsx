import "@/app/globals.css";
import { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
			<div className="min-h-screen bg-linear-to-br from-slate-900 via-slate-950 to-black text-white relative">
				<div className="">
					<div className="z-0 bg-[url('/telegramColorPattern.png')] absolute inset-0 bg-cover bg-center blur-xs"></div>
					<div className="z-0 bg-[url('/telegramPattern.png')] absolute inset-0 bg-contain bg-center opacity-20"></div>
				</div>
				<div className="mx-auto flex min-h-screen max-w-5xl items-center justify-center px-4 py-12">
					<div className="grid w-full gap-10 md:grid-cols-2">
						<section className="hidden flex-col justify-between rounded-2xl border border-white/10 p-10 shadow-2xl bg-black/20 backdrop-blur md:flex">
							<div className="space-y-4">
								<p className="inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-medium uppercase tracking-wide text-white/80">
									Hide Out • Chat
								</p>
								<h1 className="text-4xl font-semibold leading-tight text-white">
									Simple, fast chat with people or AI.
								</h1>
								<p className="text-lg text-white/70">
									Start direct conversations or spin up an AI partner in seconds. Stay
									synced across devices with a clean, focused interface.
								</p>
							</div>
							<div className="rounded-xl border border-white/10 bg-black/30 p-4 mt-4 text-sm text-white/70">
								<p className="font-semibold text-white">MVP stack</p>
								<ul className="mt-2 space-y-1">
									<li>Next.js + App Router + Server Actions + NextAuth</li>
									<li>Prisma + PosgreSQL + Neon</li>
									<li>Server Actions for auth & chat</li>
								</ul>
							</div>
						</section>
						<section className="rounded-2xl p-8 shadow-2xl bg-black/50 backdrop-blur-xs">
							{children}
						</section>
					</div>
				</div>
			</div>
		);
}

