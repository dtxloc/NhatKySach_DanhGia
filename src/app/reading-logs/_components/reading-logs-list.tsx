"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import { useFormStatus } from "react-dom";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { Database, ReadingStatus } from "@/types/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  createReadingLogAction,
  deleteReadingLogAction,
  updateReadingLogAction,
} from "../actions";

type ReadingLogRow = Database["public"]["Tables"]["reading_logs"]["Row"];
type BookLite = Pick<
  Database["public"]["Tables"]["books"]["Row"],
  "id" | "title"
>;

type UpdateState = {
  error?: string;
  success?: boolean;
};

type CreateState = {
  error?: string;
  success?: boolean;
};

type DeleteState = {
  error?: string;
  success?: boolean;
};

const initialUpdateState: UpdateState = {};
const initialCreateState: CreateState = {};
const initialDeleteState: DeleteState = {};

type ReadingLogsListProps = {
  userId: string;
  initialLogs: ReadingLogRow[];
  books: BookLite[];
};

function statusLabel(status: ReadingStatus) {
  switch (status) {
    case "want_to_read":
      return "Se doc";
    case "reading":
      return "Dang doc";
    case "finished":
      return "Da hoan thanh";
    case "paused":
      return "Tam dung";
  }
}

function statusBadgeClass(status: ReadingStatus) {
  switch (status) {
    case "finished":
      return "bg-emerald-100 text-emerald-700";
    case "reading":
      return "bg-sky-100 text-sky-700";
    case "paused":
      return "bg-amber-100 text-amber-700";
    case "want_to_read":
      return "bg-slate-100 text-slate-700";
  }
}

function SubmitButton({
  pendingLabel,
  idleLabel,
}: {
  pendingLabel: string;
  idleLabel: string;
}) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" className="w-full sm:w-auto" disabled={pending}>
      {pending ? pendingLabel : idleLabel}
    </Button>
  );
}

function CreateReadingLogForm({ books }: { books: BookLite[] }) {
  const [state, formAction] = useActionState(
    createReadingLogAction,
    initialCreateState,
  );

  if (books.length === 0) {
    return (
      <Card className="border-dashed border-slate-300 bg-white/90">
        <CardContent className="py-8 text-center text-sm text-slate-600">
          Ban can tao it nhat mot sach truoc khi them nhat ky doc.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-slate-200 bg-white/95 shadow-soft">
      <CardHeader>
        <CardTitle>Them nhat ky moi</CardTitle>
        <CardDescription>
          Chon sach va cap nhat tien do doc hien tai.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="create-book">Sach</Label>
              <select
                id="create-book"
                name="bookId"
                className="flex h-11 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
                defaultValue={books[0]?.id}
              >
                {books.map((book) => (
                  <option key={book.id} value={book.id}>
                    {book.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="create-status">Trang thai</Label>
              <select
                id="create-status"
                name="status"
                defaultValue="want_to_read"
                className="flex h-11 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
              >
                <option value="want_to_read">Se doc</option>
                <option value="reading">Dang doc</option>
                <option value="finished">Da hoan thanh</option>
                <option value="paused">Tam dung</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="create-page">Trang hien tai</Label>
              <Input
                id="create-page"
                name="currentPage"
                type="number"
                min={0}
                defaultValue={0}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="create-rating">Danh gia (0-5)</Label>
              <Input
                id="create-rating"
                name="rating"
                type="number"
                min={0}
                max={5}
                step="0.5"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="create-review">Review</Label>
              <textarea
                id="create-review"
                name="reviewText"
                rows={3}
                className="flex min-h-24 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
              />
            </div>
          </div>

          {state.error ? (
            <p className="text-sm text-red-600">{state.error}</p>
          ) : null}
          {state.success ? (
            <p className="text-sm text-emerald-700">Tao nhat ky thanh cong.</p>
          ) : null}

          <SubmitButton pendingLabel="Dang tao..." idleLabel="Them nhat ky" />
        </form>
      </CardContent>
    </Card>
  );
}

function ReadingLogEditor({ log }: { log: ReadingLogRow }) {
  const [state, formAction] = useActionState(
    updateReadingLogAction,
    initialUpdateState,
  );

  return (
    <form
      action={formAction}
      className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-4"
    >
      <input type="hidden" name="logId" value={log.id} />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-2">
          <Label htmlFor={`currentPage-${log.id}`}>Trang hien tai</Label>
          <Input
            id={`currentPage-${log.id}`}
            name="currentPage"
            type="number"
            min={0}
            defaultValue={log.current_page}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor={`status-${log.id}`}>Trang thai</Label>
          <select
            id={`status-${log.id}`}
            name="status"
            defaultValue={log.status}
            className="flex h-11 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
          >
            <option value="want_to_read">Se doc</option>
            <option value="reading">Dang doc</option>
            <option value="finished">Da hoan thanh</option>
            <option value="paused">Tam dung</option>
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor={`rating-${log.id}`}>Danh gia</Label>
          <Input
            id={`rating-${log.id}`}
            name="rating"
            type="number"
            min={0}
            max={5}
            step="0.5"
            defaultValue={log.rating ?? ""}
          />
        </div>

        <div className="space-y-2 sm:col-span-2 lg:col-span-4">
          <Label htmlFor={`reviewText-${log.id}`}>Review</Label>
          <textarea
            id={`reviewText-${log.id}`}
            name="reviewText"
            defaultValue={log.review_text ?? ""}
            rows={4}
            className="flex min-h-24 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
          />
        </div>
      </div>

      {state.error ? (
        <p className="text-sm text-red-600">{state.error}</p>
      ) : null}
      {state.success ? (
        <p className="text-sm text-emerald-700">Da luu cap nhat.</p>
      ) : null}

      <SubmitButton pendingLabel="Dang luu..." idleLabel="Luu cap nhat" />
    </form>
  );
}

function ReadingLogCard({
  log,
  booksById,
  isActive,
  onToggleActive,
}: {
  log: ReadingLogRow;
  booksById: Record<string, string>;
  isActive: boolean;
  onToggleActive: () => void;
}) {
  const [deleteState, deleteFormAction] = useActionState(
    deleteReadingLogAction,
    initialDeleteState,
  );

  return (
    <Card
      key={log.id}
      className="border-slate-200 bg-white/95 shadow-soft transition-shadow hover:shadow-xl"
    >
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div className="space-y-2">
          <CardTitle className="text-lg">
            {booksById[log.book_id] ?? `Sach ${log.book_id.slice(0, 8)}`}
          </CardTitle>
          <CardDescription>
            Trang hien tai: {log.current_page} · Danh gia:{" "}
            {log.rating ?? "Chua co"}
          </CardDescription>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-xs font-medium ${statusBadgeClass(log.status)}`}
        >
          {statusLabel(log.status)}
        </span>
      </CardHeader>
      <CardContent className="space-y-4">
        {log.review_text ? (
          <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-700">
            {log.review_text}
          </p>
        ) : null}

        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="secondary" onClick={onToggleActive}>
            {isActive ? "Dong" : "Chinh sua"}
          </Button>
          <form action={deleteFormAction}>
            <input type="hidden" name="logId" value={log.id} />
            <Button type="submit" variant="ghost">
              Xoa
            </Button>
          </form>
        </div>

        {deleteState.error ? (
          <p className="text-sm text-red-600">{deleteState.error}</p>
        ) : null}
        {deleteState.success ? (
          <p className="text-sm text-emerald-700">Da xoa nhat ky thanh cong.</p>
        ) : null}

        {isActive ? <ReadingLogEditor log={log} /> : null}
      </CardContent>
    </Card>
  );
}

export function ReadingLogsList({
  userId,
  initialLogs,
  books,
}: ReadingLogsListProps) {
  const [logs, setLogs] = useState(initialLogs);
  const [activeId, setActiveId] = useState<string | null>(null);
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);

  const booksById = useMemo(() => {
    return Object.fromEntries(books.map((book) => [book.id, book.title]));
  }, [books]);

  useEffect(() => {
    setLogs(initialLogs);
  }, [initialLogs]);

  useEffect(() => {
    const channel = supabase
      .channel(`reading_logs:${userId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "reading_logs",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          setLogs((currentLogs) => {
            if (payload.eventType === "DELETE") {
              return currentLogs.filter((log) => log.id !== payload.old.id);
            }

            const nextLog = payload.new as ReadingLogRow;
            const withoutCurrent = currentLogs.filter(
              (log) => log.id !== nextLog.id,
            );
            return [nextLog, ...withoutCurrent].sort((left, right) => {
              const leftDate = left.created_at
                ? new Date(left.created_at).getTime()
                : 0;
              const rightDate = right.created_at
                ? new Date(right.created_at).getTime()
                : 0;
              return rightDate - leftDate;
            });
          });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, userId]);

  return (
    <div className="space-y-6">
      <CreateReadingLogForm books={books} />

      {logs.length === 0 ? (
        <Card className="border-dashed border-slate-300 bg-white/80 shadow-soft">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-base font-medium text-slate-900">
              Chua co nhat ky doc sach nao.
            </p>
            <p className="mt-2 max-w-sm text-sm text-slate-600">
              Sau khi tao hoac cap nhat, du lieu se tu dong dong bo qua
              Realtime.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {logs.map((log) => (
            <ReadingLogCard
              key={log.id}
              log={log}
              booksById={booksById}
              isActive={activeId === log.id}
              onToggleActive={() =>
                setActiveId((prev) => (prev === log.id ? null : log.id))
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
