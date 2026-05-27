"use client";

import { useEffect, useId, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { uploadBookCoverFile } from "@/lib/supabase/storage";

type BookCoverUploaderProps = {
  label?: string;
  description?: string;
  value?: string;
  name?: string;
  onUploaded?: (publicUrl: string) => void;
};

export function BookCoverUploader({
  label = "Ảnh bìa sách",
  description = "Chọn ảnh JPEG hoặc PNG dưới 2MB để tải lên Supabase Storage.",
  value = "",
  name = "cover_image_url",
  onUploaded,
}: BookCoverUploaderProps) {
  const inputId = useId();
  const [publicUrl, setPublicUrl] = useState(value);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    setPublicUrl(value);
  }, [value]);

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setError(null);
    setUploading(true);

    try {
      const { publicUrl: nextPublicUrl } = await uploadBookCoverFile(file);
      setPublicUrl(nextPublicUrl);
      onUploaded?.(nextPublicUrl);
    } catch (uploadError) {
      const message =
        uploadError instanceof Error
          ? uploadError.message
          : "Upload ảnh bìa thất bại.";
      setError(message);
      event.currentTarget.value = "";
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="space-y-1">
        <Label htmlFor={inputId}>{label}</Label>
        <p className="text-sm text-slate-500">{description}</p>
      </div>

      <Input
        id={inputId}
        type="file"
        accept="image/jpeg,image/png"
        onChange={handleFileChange}
        disabled={uploading}
        className="cursor-pointer"
      />

      {name ? <input type="hidden" name={name} value={publicUrl} /> : null}

      <div className="flex flex-wrap items-center gap-3">
        <Button
          type="button"
          variant="secondary"
          disabled={uploading}
          onClick={() => document.getElementById(inputId)?.click()}
        >
          {uploading ? "Đang tải ảnh..." : "Chọn ảnh bìa"}
        </Button>
        {publicUrl ? (
          <a
            href={publicUrl}
            target="_blank"
            rel="noreferrer"
            className="text-sm font-medium text-slate-900 underline underline-offset-4"
          >
            Xem ảnh đã upload
          </a>
        ) : null}
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      {publicUrl ? (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
          <img
            src={publicUrl}
            alt="Ảnh bìa sách"
            className="h-56 w-full object-cover"
          />
        </div>
      ) : null}
    </div>
  );
}
