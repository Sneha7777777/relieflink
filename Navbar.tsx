import Link from "next/link";
import { auth, signOut } from "@/lib/auth";
import { Button } from "@/components/ui/Button";

export async function Navbar() {
  const session = await auth();

  return (
    <header className="border-b border-slate-200 bg-white/80 backdrop-blur sticky top-0 z-40">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2 font-semibold text-slate-900">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-urgent-high" />
          ReliefLink
        </Link>

        <nav className="flex items-center gap-4 text-sm">
          {session?.user ? (
            <>
              <Link href="/dashboard" className="text-slate-600 hover:text-slate-900">
                Dashboard
              </Link>
              {session.user.role === "COORDINATOR" && (
                <Link href="/dashboard/admin" className="text-slate-600 hover:text-slate-900">
                  Coordinator
                </Link>
              )}
              <span className="hidden sm:inline text-slate-400">|</span>
              <span className="hidden sm:inline text-slate-500">{session.user.name}</span>
              <form
                action={async () => {
                  "use server";
                  await signOut({ redirectTo: "/" });
                }}
              >
                <Button type="submit" variant="ghost" className="px-2 py-1">
                  Sign out
                </Button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login" className="text-slate-600 hover:text-slate-900">
                Log in
              </Link>
              <Link href="/register">
                <Button className="px-3 py-1.5">Get started</Button>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
