import { redirect } from "next/navigation";
import { SiteHeader } from "@/components/layout/site-header";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ReadingLogsList } from "./_components/reading-logs-list";

export default async function ReadingLogsPage() {
  const supabase = await createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();

  if (!userData.user) {
    redirect("/auth/login");
  }

  const [{ data: logs }, { data: books }] = await Promise.all([
    supabase
      .from("reading_logs")
      .select("*")
      .eq("user_id", userData.user.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("books")
      .select("id,title")
      .order("title", { ascending: true }),
  ]);

  return (
    <>
      <SiteHeader userEmail={userData.user.email ?? ""} />
      <main className="min-h-[calc(100vh-4rem)] bg-slate-100 px-4 py-10">
        <div className="mx-auto max-w-5xl space-y-6">
          <header className="space-y-2">
            <h1 className="text-3xl font-semibold text-slate-900">
              Nhat ky doc sach
            </h1>
            <p className="text-sm text-slate-600">
              Danh sach duoc dong bo tuc thi qua Supabase Realtime khi bang
              reading_logs thay doi.
            </p>
          </header>

          <ReadingLogsList
            userId={userData.user.id}
            initialLogs={logs ?? []}
            books={books ?? []}
          />
        </div>
      </main>
    </>
  );
}
