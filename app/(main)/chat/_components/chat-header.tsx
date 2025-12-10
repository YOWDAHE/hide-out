import { logout } from "@/app/actions/auth";

type Props = {
  user: { name: string | null; email: string; image?: string | null };
};

export default function ChatHeader({ user }: Props) {
  const initial = user.name?.[0]?.toUpperCase() || user.email[0]?.toUpperCase();

  return (
    <header className="mb-4 flex items-center justify-between rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 shadow-sm">
      <div>
        <p className="text-sm font-semibold text-slate-900">Hide Out</p>
        <p className="text-xs text-slate-500">Stay in sync across chats</p>
      </div>
      <details className="relative group">
        <summary className="flex cursor-pointer items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-left text-sm font-semibold text-slate-900 shadow-sm hover:border-blue-300 focus:outline-none">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-base font-bold text-blue-700">
            {initial}
          </div>
          <div className="leading-tight">
            <p>{user.name || user.email}</p>
            <span className="text-xs font-normal text-slate-500">Online</span>
          </div>
          <span className="text-slate-400">▾</span>
        </summary>
        <div className="absolute right-0 mt-2 w-48 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg shadow-slate-200/80">
          <div className="px-4 py-3 text-sm text-slate-700">
            <p className="font-semibold">{user.name || "Account"}</p>
            <p className="truncate text-xs text-slate-500">{user.email}</p>
          </div>
          <form action={logout}>
            <button
              type="submit"
              className="flex w-full items-center gap-2 px-4 py-3 text-sm font-semibold text-red-500 hover:bg-slate-50"
            >
              <span>⎋</span>
              <span>Log out</span>
            </button>
          </form>
        </div>
      </details>
    </header>
  );
}

