import Link from "next/link";
import { signOutAction } from "@/app/auth/actions";
import { Button } from "@/components/ui/button";

type SiteHeaderProps = {
  userEmail?: string;
};

export function SiteHeader({ userEmail }: SiteHeaderProps) {
  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4">
        <Link
          href="/"
          className="text-lg font-semibold tracking-tight text-slate-900"
        >
          Nhat Ky Doc Sach
        </Link>

        <nav className="flex items-center gap-2">
          <Link
            href="/books"
            className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            Sach
          </Link>
          <Link
            href="/books/new"
            className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            Them Sach
          </Link>
          <Link
            href="/reading-logs"
            className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            Nhat Ky
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          {userEmail ? (
            <span className="hidden text-sm text-slate-600 md:inline">
              {userEmail}
            </span>
          ) : null}
          <form action={signOutAction}>
            <Button type="submit" variant="secondary" className="h-9 px-3">
              Dang xuat
            </Button>
          </form>
        </div>
      </div>
    </header>
  );
}
