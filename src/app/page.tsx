import Link from "next/link";
import { redirect } from "next/navigation";
import { SiteHeader } from "@/components/layout/site-header";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function HomePage() {
  const supabase = await createSupabaseServerClient();
  const { data: authData } = await supabase.auth.getUser();

  if (!authData.user) {
    redirect("/auth/login");
  }

  const userId = authData.user.id;

  const [{ count: booksCount }, { data: logs }] = await Promise.all([
    supabase.from("books").select("*", { count: "exact", head: true }),
    supabase.from("reading_logs").select("status,rating").eq("user_id", userId),
  ]);

  const logItems = logs ?? [];
  const totalLogs = logItems.length;
  const finishedCount = logItems.filter(
    (item) => item.status === "finished",
  ).length;
  const readingCount = logItems.filter(
    (item) => item.status === "reading",
  ).length;
  const ratings = logItems
    .map((item) => item.rating)
    .filter((item): item is number => item !== null);
  const avgRating =
    ratings.length > 0
      ? (
          ratings.reduce((acc, value) => acc + value, 0) / ratings.length
        ).toFixed(1)
      : "-";

  return (
    <>
      <SiteHeader userEmail={authData.user.email ?? ""} />

      <main className="min-h-[calc(100vh-4rem)] bg-[radial-gradient(circle_at_top,_#f8fafc,_#e2e8f0_55%,_#cbd5e1)] px-4 py-10">
        <div className="mx-auto max-w-6xl space-y-8">
          <section className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-soft md:p-8">
            <p className="text-sm font-medium text-slate-500">Tong quan</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl">
              Dashboard Nhat Ky Doc Sach
            </h1>
            <p className="mt-3 max-w-2xl text-sm text-slate-600 md:text-base">
              Quan ly sach, cap nhat tien do doc va theo doi du lieu theo thoi
              gian thuc voi Supabase.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/books/new"
                className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
              >
                Them sach moi
              </Link>
              <Link
                href="/reading-logs"
                className="rounded-xl bg-white px-4 py-2 text-sm font-medium text-slate-900 ring-1 ring-slate-300 hover:bg-slate-50"
              >
                Cap nhat nhat ky
              </Link>
            </div>
          </section>

          <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <article className="rounded-2xl border border-slate-200 bg-white/95 p-5 shadow-soft">
              <p className="text-sm text-slate-500">Tong so sach</p>
              <p className="mt-2 text-3xl font-semibold text-slate-900">
                {booksCount ?? 0}
              </p>
            </article>
            <article className="rounded-2xl border border-slate-200 bg-white/95 p-5 shadow-soft">
              <p className="text-sm text-slate-500">Tong nhat ky</p>
              <p className="mt-2 text-3xl font-semibold text-slate-900">
                {totalLogs}
              </p>
            </article>
            <article className="rounded-2xl border border-slate-200 bg-white/95 p-5 shadow-soft">
              <p className="text-sm text-slate-500">Dang doc</p>
              <p className="mt-2 text-3xl font-semibold text-slate-900">
                {readingCount}
              </p>
            </article>
            <article className="rounded-2xl border border-slate-200 bg-white/95 p-5 shadow-soft">
              <p className="text-sm text-slate-500">Diem danh gia TB</p>
              <p className="mt-2 text-3xl font-semibold text-slate-900">
                {avgRating}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Hoan thanh: {finishedCount}
              </p>
            </article>
          </section>
        </div>
      </main>
    </>
  );
}
