"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { Database } from "@/types/supabase";
import { Button } from "@/components/ui/button";
import { BookCoverUploader } from "@/components/books/book-cover-uploader";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  deleteBookAction,
  type BookMutationState,
  updateBookAction,
} from "../actions";

type BookRow = Database["public"]["Tables"]["books"]["Row"];

const initialState: BookMutationState = {};

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

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

function highlightText(text: string, keyword: string) {
  const normalized = keyword.trim();

  if (!normalized) {
    return text;
  }

  const pattern = new RegExp(`(${escapeRegExp(normalized)})`, "gi");
  const parts = text.split(pattern);

  const exactMatchNodes = parts.map((part, index) =>
    part.toLowerCase() === normalized.toLowerCase() ? (
      <mark key={`${part}-${index}`} className="rounded bg-yellow-200 px-1">
        {part}
      </mark>
    ) : (
      <span key={`${part}-${index}`}>{part}</span>
    ),
  );

  if (parts.length > 1) {
    return exactMatchNodes;
  }

  const normalizedText = normalizeForSearch(text);
  const normalizedKeyword = normalizeForSearch(keyword);

  if (normalizedKeyword && normalizedText.includes(normalizedKeyword)) {
    return <mark className="rounded bg-yellow-200 px-1">{text}</mark>;
  }

  return text;
}

function BookEditor({
  book,
  onSaved,
}: {
  book: BookRow;
  onSaved?: () => void;
}) {
  const router = useRouter();
  const handledUpdateKeyRef = useRef<string | null>(null);
  const latestCoverUrlRef = useRef<string>(book.cover_image_url ?? "");
  const onSavedRef = useRef(onSaved);

  const [state, formAction, pending] = useActionState(
    updateBookAction,
    initialState,
  );
  const [coverUrl, setCoverUrl] = useState<string>(book.cover_image_url ?? "");
  const [delState, delAction, delPending] = useActionState(
    deleteBookAction,
    initialState,
  );

  useEffect(() => {
    onSavedRef.current = onSaved;
  }, [onSaved]);

  useEffect(() => {
    setCoverUrl(book.cover_image_url ?? "");
    latestCoverUrlRef.current = book.cover_image_url ?? "";
  }, [book.cover_image_url]);

  useEffect(() => {
    if (!state.success || !state.book) {
      return;
    }

    const updateKey = [
      state.book.id,
      state.book.title,
      state.book.author,
      state.book.total_pages,
      state.book.cover_image_url ?? "",
    ].join("|");

    if (handledUpdateKeyRef.current === updateKey) {
      return;
    }

    handledUpdateKeyRef.current = updateKey;
    latestCoverUrlRef.current = state.book.cover_image_url ?? "";
    setCoverUrl(latestCoverUrlRef.current);
    onSavedRef.current?.();
    router.refresh();
  }, [state.success, state.book, router]);

  useEffect(() => {
    if (delState.success) {
      router.refresh();
    }
  }, [delState.success, router]);

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="grid gap-6 md:grid-cols-[1fr_320px]">
        <form
          action={formAction}
          className="space-y-4"
          data-book-form-id={book.id}
        >
          <input type="hidden" name="book_id" value={book.id} />

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor={`title-${book.id}`}>Tên sách</Label>
              <Input
                id={`title-${book.id}`}
                name="title"
                defaultValue={book.title}
                key={`title-key-${book.title}`}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`author-${book.id}`}>Tác giả</Label>
              <Input
                id={`author-${book.id}`}
                name="author"
                defaultValue={book.author}
                key={`author-key-${book.author}`}
                required
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor={`pages-${book.id}`}>Tổng số trang</Label>
              <Input
                id={`pages-${book.id}`}
                name="total_pages"
                type="number"
                min={1}
                defaultValue={book.total_pages}
                key={`pages-key-${book.total_pages}`}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`cover-url-${book.id}`}>Cover URL</Label>
              <input type="hidden" name="cover_image_url" value={coverUrl} />
              <Input
                id={`cover-url-${book.id}`}
                value={coverUrl}
                placeholder="https://..."
                onChange={(e) => setCoverUrl(e.target.value)}
              />
            </div>
          </div>

          {state.error ? (
            <p className="text-sm text-red-600">{state.error}</p>
          ) : null}
          {state.success ? (
            <p className="text-sm text-emerald-700">{state.success}</p>
          ) : null}

          <div className="flex items-center justify-end gap-3">
            <Button type="submit" disabled={pending}>
              {pending ? "Đang lưu..." : "Lưu thay đổi"}
            </Button>
          </div>
        </form>

        <aside className="space-y-4">
          <div className="space-y-2">
            <Label>Ảnh bìa</Label>
            <div className="rounded-lg border border-slate-200 bg-white p-3">
              <BookCoverUploader
                name={""}
                value={coverUrl}
                onUploaded={(url) => setCoverUrl(url)}
              />
            </div>
          </div>

          {coverUrl ? (
            <div className="overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
              <img
                src={coverUrl}
                alt={`Bìa ${book.title}`}
                className="h-36 w-full object-cover"
              />
            </div>
          ) : null}

          <div className="text-sm text-slate-500">
            Bạn có thể upload file hoặc dán URL.
          </div>
        </aside>
      </div>

      <form action={delAction} className="mt-3 m-0">
        <input type="hidden" name="book_id" value={book.id} />
        <Button type="submit" variant="ghost" disabled={delPending}>
          {delPending ? "Đang xóa..." : "Xóa sách"}
        </Button>
      </form>

      {delState.error ? (
        <p className="mt-2 text-sm text-red-600">{delState.error}</p>
      ) : null}
    </div>
  );
}

export function BooksManager({
  books,
  keyword,
}: {
  books: BookRow[];
  keyword: string;
}) {
  const [activeId, setActiveId] = useState<string | null>(null);

  if (books.length === 0) {
    return (
      <Card className="border-dashed border-slate-300 bg-white/90">
        <CardContent className="py-14 text-center">
          <p className="text-base font-medium text-slate-900">
            Chua co sach nao trong he thong.
          </p>
          <Link
            href="/books/new"
            className="mt-3 inline-block text-sm font-medium text-slate-900 underline underline-offset-4"
          >
            Them sach dau tien
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {books.map((book) => (
        <Card
          key={book.id}
          className="border-slate-200 bg-white/95 shadow-soft"
        >
          <CardHeader className="flex flex-row items-start justify-between gap-4">
            <div>
              <CardTitle>
                <Link
                  href={`/books/${book.id}`}
                  className="underline decoration-transparent underline-offset-4 transition hover:decoration-slate-400"
                >
                  {highlightText(book.title, keyword)}
                </Link>
              </CardTitle>
              <CardDescription>
                {highlightText(book.author, keyword)} · {book.total_pages} trang
              </CardDescription>
            </div>
            <Button
              type="button"
              variant="secondary"
              className="h-9"
              onClick={() =>
                setActiveId((prev) => (prev === book.id ? null : book.id))
              }
            >
              {activeId === book.id ? "Đóng" : "Sửa"}
            </Button>
          </CardHeader>

          <CardContent className="space-y-4">
            {book.cover_image_url ? (
              <img
                src={book.cover_image_url}
                alt={`Bia sach ${book.title}`}
                className="h-48 w-full rounded-xl object-cover"
              />
            ) : (
              <div className="flex h-32 items-center justify-center rounded-xl border border-dashed border-slate-300 text-sm text-slate-500">
                Chua co anh bia
              </div>
            )}

            {activeId === book.id ? (
              <BookEditor book={book} onSaved={() => setActiveId(null)} />
            ) : null}

            <Link
              href={`/books/${book.id}`}
              className="inline-block text-sm font-medium text-slate-700 underline underline-offset-4"
            >
              Xem chi tiet sach
            </Link>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
