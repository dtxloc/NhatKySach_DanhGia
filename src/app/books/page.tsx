import { redirect } from "next/navigation";
import { SiteHeader } from "@/components/layout/site-header";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { BooksFilters } from "./_components/books-filters";
import { BooksManager } from "./_components/books-manager";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function normalizeForSearch(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

type BooksPageProps = {
  searchParams: Promise<{
    q?: string;
    sort?: string;
    page?: string;
  }>;
};

export default async function BooksPage({ searchParams }: BooksPageProps) {
  const supabase = await createSupabaseServerClient();
  const { data: authData } = await supabase.auth.getUser();

  if (!authData.user) {
    redirect("/auth/login");
  }

  const resolvedSearchParams = await searchParams;
  const q = String(resolvedSearchParams?.q ?? "").trim();
  const sort = String(resolvedSearchParams?.sort ?? "newest");
  const pageRaw = Number.parseInt(
    String(resolvedSearchParams?.page ?? "1"),
    10,
  );
  const currentPage = Number.isFinite(pageRaw) && pageRaw > 0 ? pageRaw : 1;
  const pageSize = 6;

  let query = supabase.from("books").select("*");

  if (sort === "title_asc") {
    query = query.order("title", { ascending: true });
  } else if (sort === "title_desc") {
    query = query.order("title", { ascending: false });
  } else if (sort === "pages_desc") {
    query = query.order("total_pages", { ascending: false });
  } else if (sort === "pages_asc") {
    query = query.order("total_pages", { ascending: true });
  } else {
    query = query.order("created_at", { ascending: false });
  }

  const { data: books } = await query;
  const normalizedQuery = normalizeForSearch(q);
  const filteredBooks =
    normalizedQuery.length === 0
      ? (books ?? [])
      : (books ?? []).filter((book) => {
          const searchableText = normalizeForSearch(
            `${book.title} ${book.author}`,
          );
          return searchableText.includes(normalizedQuery);
        });

  const totalBooks = filteredBooks.length;
  const totalPages = Math.max(1, Math.ceil(totalBooks / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const from = (safeCurrentPage - 1) * pageSize;
  const pagedBooks = filteredBooks.slice(from, from + pageSize);

  return (
    <>
      <SiteHeader userEmail={authData.user.email ?? ""} />
      <main className="min-h-[calc(100vh-4rem)] bg-slate-100 px-4 py-10">
        <div className="mx-auto max-w-5xl space-y-6">
          <header className="space-y-2">
            <h1 className="text-3xl font-semibold text-slate-900">
              Quan ly Sach
            </h1>
            <p className="text-sm text-slate-600">
              Sua hoac xoa sach hien co. De them moi, vao muc Them Sach tren
              thanh dieu huong.
            </p>
          </header>

          <BooksFilters
            q={q}
            sort={sort}
            page={safeCurrentPage}
            totalPages={totalPages}
          />

          <p className="text-sm text-slate-600">
            Tim thay {totalBooks} ket qua.
          </p>

          <BooksManager books={pagedBooks} keyword={q} />
        </div>
      </main>
    </>
  );
}
