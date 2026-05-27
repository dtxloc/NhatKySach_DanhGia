import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { SiteHeader } from "@/components/layout/site-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type BookDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function BookDetailPage({ params }: BookDetailPageProps) {
  const supabase = await createSupabaseServerClient();
  const { data: authData } = await supabase.auth.getUser();

  if (!authData.user) {
    redirect("/auth/login");
  }

  const resolvedParams = await params;
  const bookId = resolvedParams.id;

  const [{ data: book }, { data: logs }] = await Promise.all([
    supabase.from("books").select("*").eq("id", bookId).single(),
    supabase
      .from("reading_logs")
      .select("*")
      .eq("book_id", bookId)
      .eq("user_id", authData.user.id)
      .order("created_at", { ascending: false }),
  ]);

  if (!book) {
    notFound();
  }

  return (
    <>
      <SiteHeader userEmail={authData.user.email ?? ""} />
      <main className="min-h-[calc(100vh-4rem)] bg-slate-100 px-4 py-10">
        <div className="mx-auto max-w-5xl space-y-6">
          <Link
            href="/books"
            className="inline-block text-sm font-medium text-slate-700 underline underline-offset-4"
          >
            Quay lai danh sach sach
          </Link>

          <Card className="border-slate-200 bg-white/95 shadow-soft">
            <CardHeader>
              <CardTitle className="text-3xl text-slate-900">
                {book.title}
              </CardTitle>
              <p className="text-sm text-slate-600">{book.author}</p>
            </CardHeader>
            <CardContent className="grid gap-6 md:grid-cols-[280px_1fr]">
              {book.cover_image_url ? (
                <img
                  src={book.cover_image_url}
                  alt={`Bia sach ${book.title}`}
                  className="h-80 w-full rounded-2xl object-cover"
                />
              ) : (
                <div className="flex h-80 items-center justify-center rounded-2xl border border-dashed border-slate-300 text-sm text-slate-500">
                  Chua co anh bia
                </div>
              )}

              <div className="space-y-3 text-sm text-slate-700">
                <p>
                  <span className="font-medium text-slate-900">
                    Tong so trang:
                  </span>{" "}
                  {book.total_pages}
                </p>
                <p>
                  <span className="font-medium text-slate-900">Book ID:</span>{" "}
                  {book.id}
                </p>
                <p>
                  <span className="font-medium text-slate-900">
                    So lan ghi nhat ky:
                  </span>{" "}
                  {logs?.length ?? 0}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 bg-white/95 shadow-soft">
            <CardHeader>
              <CardTitle className="text-xl">Nhat ky doc lien quan</CardTitle>
            </CardHeader>
            <CardContent>
              {!logs || logs.length === 0 ? (
                <p className="text-sm text-slate-600">
                  Ban chua co nhat ky nao cho cuon sach nay.
                </p>
              ) : (
                <ul className="space-y-3">
                  {logs.map((log) => (
                    <li
                      key={log.id}
                      className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700"
                    >
                      <p>
                        <span className="font-medium text-slate-900">
                          Trang thai:
                        </span>{" "}
                        {log.status}
                      </p>
                      <p>
                        <span className="font-medium text-slate-900">
                          Tien do:
                        </span>{" "}
                        {log.current_page} trang
                      </p>
                      <p>
                        <span className="font-medium text-slate-900">
                          Danh gia:
                        </span>{" "}
                        {log.rating ?? "Chua co"}
                      </p>
                      {log.review_text ? (
                        <p className="mt-2 rounded-lg bg-white p-3 text-slate-700">
                          {log.review_text}
                        </p>
                      ) : null}
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
