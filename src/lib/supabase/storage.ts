import { createSupabaseBrowserClient } from "@/lib/supabase/client";

const MAX_BOOK_COVER_SIZE = 2 * 1024 * 1024;
const ALLOWED_BOOK_COVER_TYPES = ["image/jpeg", "image/png"] as const;

export function validateBookCoverFile(file: File) {
  if (
    !ALLOWED_BOOK_COVER_TYPES.includes(
      file.type as (typeof ALLOWED_BOOK_COVER_TYPES)[number],
    )
  ) {
    return "Chỉ chấp nhận ảnh JPEG hoặc PNG.";
  }

  if (file.size > MAX_BOOK_COVER_SIZE) {
    return "Ảnh bìa phải nhỏ hơn 2MB.";
  }

  return null;
}

export async function uploadBookCoverFile(file: File) {
  const validationError = validateBookCoverFile(file);
  if (validationError) {
    throw new Error(validationError);
  }

  const supabase = createSupabaseBrowserClient();
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const path = `books/${crypto.randomUUID()}-${safeName}`;

  const { error: uploadError } = await supabase.storage
    .from("book-covers")
    .upload(path, file, {
      contentType: file.type,
      upsert: false,
    });

  if (uploadError) {
    throw new Error(uploadError.message);
  }

  const { data } = supabase.storage.from("book-covers").getPublicUrl(path);

  if (!data.publicUrl) {
    throw new Error("Không thể lấy public URL của ảnh bìa.");
  }

  return {
    path,
    publicUrl: data.publicUrl,
  };
}
