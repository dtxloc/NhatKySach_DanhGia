"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type BooksFiltersProps = {
  q: string;
  sort: string;
  page: number;
  totalPages: number;
};

export function BooksFilters({ q, sort, page, totalPages }: BooksFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [queryText, setQueryText] = useState(q);
  const [sortValue, setSortValue] = useState(sort || "newest");

  useEffect(() => {
    setQueryText(q);
  }, [q]);

  useEffect(() => {
    setSortValue(sort || "newest");
  }, [sort]);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      const nextQ = queryText.trim();
      const currentQ = (searchParams.get("q") ?? "").trim();
      const currentSort = searchParams.get("sort") ?? "newest";

      if (nextQ === currentQ && sortValue === currentSort) {
        return;
      }

      const params = new URLSearchParams(searchParams.toString());

      if (nextQ) {
        params.set("q", nextQ);
      } else {
        params.delete("q");
      }

      params.set("sort", sortValue || "newest");
      params.set("page", "1");

      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [pathname, queryText, router, searchParams, sortValue]);

  const goToPage = (nextPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(nextPage));
    params.set("sort", sortValue || "newest");

    const nextQ = queryText.trim();
    if (nextQ) {
      params.set("q", nextQ);
    } else {
      params.delete("q");
    }

    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="space-y-3 rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-soft">
      <div className="grid gap-4 md:grid-cols-[1fr_220px] md:items-end">
        <div className="space-y-2">
          <Label htmlFor="q">Tim kiem sach</Label>
          <Input
            id="q"
            name="q"
            placeholder="Tim theo ten sach hoac tac gia..."
            value={queryText}
            onChange={(event) => setQueryText(event.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="sort">Sap xep</Label>
          <select
            id="sort"
            name="sort"
            value={sortValue}
            onChange={(event) => setSortValue(event.target.value)}
            className="flex h-11 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
          >
            <option value="newest">Moi nhat</option>
            <option value="title_asc">Ten A-Z</option>
            <option value="title_desc">Ten Z-A</option>
            <option value="pages_desc">Trang giam dan</option>
            <option value="pages_asc">Trang tang dan</option>
          </select>
        </div>
      </div>

      <p className="text-xs text-slate-500">
        Tim kiem tu dong khi ban go (tre ~300ms, khong can bam Ap dung).
      </p>

      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-600">
          Trang {Math.min(page, totalPages)} / {totalPages}
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => goToPage(Math.max(1, page - 1))}
            aria-disabled={page <= 1}
            disabled={page <= 1}
            className={`inline-flex h-10 items-center justify-center rounded-xl border px-4 text-sm font-medium transition ${
              page <= 1
                ? "border-slate-200 bg-slate-100 text-slate-400"
                : "border-slate-200 bg-white text-slate-900 hover:bg-slate-50"
            }`}
          >
            Trang truoc
          </button>
          <button
            type="button"
            onClick={() => goToPage(Math.min(totalPages, page + 1))}
            aria-disabled={page >= totalPages}
            disabled={page >= totalPages}
            className={`inline-flex h-10 items-center justify-center rounded-xl border px-4 text-sm font-medium transition ${
              page >= totalPages
                ? "border-slate-200 bg-slate-100 text-slate-400"
                : "border-slate-200 bg-white text-slate-900 hover:bg-slate-50"
            }`}
          >
            Trang sau
          </button>
        </div>
      </div>
    </div>
  );
}
