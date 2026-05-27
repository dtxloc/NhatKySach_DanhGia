"use client";

import { useActionState, useEffect, useState } from "react";
import { BookCoverUploader } from "@/components/books/book-cover-uploader";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createBookAction, type CreateBookState } from "../actions";

const initialState: CreateBookState = {};

export function CreateBookForm() {
  const [state, formAction, pending] = useActionState(
    createBookAction,
    initialState,
  );
  const [coverUrl, setCoverUrl] = useState("");

  useEffect(() => {
    if (state.success) {
      setCoverUrl("");
    }
  }, [state.success]);

  return (
    <Card className="border-slate-200 bg-white/95 shadow-soft">
      <CardHeader>
        <CardTitle className="text-2xl">Thêm sách mới</CardTitle>
        <CardDescription>
          Điền thông tin sách và upload ảnh bìa lên Supabase Storage bucket
          book-covers.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-6">
          {state.error ? (
            <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {state.error}
            </p>
          ) : null}
          {state.success ? (
            <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {state.success}
            </p>
          ) : null}

          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="title">Tên sách</Label>
              <Input
                id="title"
                name="title"
                placeholder="Nhà Giả Kim"
                required
              />
              {state.fieldErrors?.title ? (
                <p className="text-sm text-red-600">
                  {state.fieldErrors.title}
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="author">Tác giả</Label>
              <Input
                id="author"
                name="author"
                placeholder="Paulo Coelho"
                required
              />
              {state.fieldErrors?.author ? (
                <p className="text-sm text-red-600">
                  {state.fieldErrors.author}
                </p>
              ) : null}
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="total_pages">Tổng số trang</Label>
              <Input
                id="total_pages"
                name="total_pages"
                type="number"
                min={1}
                placeholder="224"
                required
              />
              {state.fieldErrors?.total_pages ? (
                <p className="text-sm text-red-600">
                  {state.fieldErrors.total_pages}
                </p>
              ) : null}
            </div>
          </div>

          <BookCoverUploader
            name={""}
            value={coverUrl}
            onUploaded={(url) => {
              setCoverUrl(url);
            }}
          />
          <div className="space-y-2">
            <Label htmlFor="cover_image_url">Hoặc dán URL ảnh bìa</Label>
            <Input
              id="cover_image_url"
              name="cover_image_url"
              placeholder="https://..."
              value={coverUrl}
              onChange={(e) => setCoverUrl(e.target.value)}
            />
          </div>
          {state.fieldErrors?.cover_image_url ? (
            <p className="text-sm text-red-600">
              {state.fieldErrors.cover_image_url}
            </p>
          ) : null}

          <Button type="submit" disabled={pending}>
            {pending ? "Đang lưu..." : "Thêm sách"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
