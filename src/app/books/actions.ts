"use server";

import { revalidatePath } from "next/cache";
import {
  createSupabaseAdminClient,
  createSupabaseServerClient,
} from "@/lib/supabase/server";
import type { Database } from "@/types/supabase";

type BookRow = Database["public"]["Tables"]["books"]["Row"];

type CreateBookFieldErrors = {
  title?: string;
  author?: string;
  total_pages?: string;
  cover_image_url?: string;
};

export type CreateBookState = {
  error?: string;
  success?: string;
  fieldErrors?: CreateBookFieldErrors;
};

export type BookMutationState = {
  error?: string;
  success?: string;
  book?: BookRow;
};

function isValidUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

export async function createBookAction(
  _: CreateBookState,
  formData: FormData,
): Promise<CreateBookState> {
  const title = String(formData.get("title") ?? "").trim();
  const author = String(formData.get("author") ?? "").trim();
  const totalPagesRaw = String(formData.get("total_pages") ?? "").trim();
  const coverImageUrlRaw = String(formData.get("cover_image_url") ?? "").trim();

  const fieldErrors: CreateBookFieldErrors = {};

  if (!title) {
    fieldErrors.title = "Vui lòng nhập tên sách.";
  }

  if (!author) {
    fieldErrors.author = "Vui lòng nhập tên tác giả.";
  }

  const totalPages = Number(totalPagesRaw);
  if (!Number.isInteger(totalPages) || totalPages <= 0) {
    fieldErrors.total_pages = "Tổng số trang phải là số nguyên dương.";
  }

  if (coverImageUrlRaw && !isValidUrl(coverImageUrlRaw)) {
    fieldErrors.cover_image_url = "URL ảnh bìa không hợp lệ.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { fieldErrors };
  }

  const authSupabase = await createSupabaseServerClient();
  const { data: authData, error: authError } =
    await authSupabase.auth.getUser();

  if (authError || !authData.user) {
    return { error: "Bạn cần đăng nhập để thêm sách." };
  }

  const supabase = await createSupabaseAdminClient();

  const { data: insertedRows, error: insertError } = await supabase
    .from("books")
    .insert({
      title,
      author,
      total_pages: totalPages,
      cover_image_url: coverImageUrlRaw || null,
    })
    .select("*");

  if (insertError) {
    return { error: insertError.message };
  }

  if (!insertedRows || insertedRows.length === 0) {
    return {
      error:
        "Không lưu được sách. Hãy cấu hình SUPABASE_SERVICE_ROLE_KEY hoặc policy ghi cho bảng books.",
    };
  }

  revalidatePath("/books/new");
  revalidatePath("/books");
  return { success: "Thêm sách thành công." };
}

export async function updateBookAction(
  _: BookMutationState,
  formData: FormData,
): Promise<BookMutationState> {
  const bookId = String(formData.get("book_id") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const author = String(formData.get("author") ?? "").trim();
  const totalPagesRaw = String(formData.get("total_pages") ?? "").trim();
  const coverImageUrlRaw = String(formData.get("cover_image_url") ?? "").trim();

  if (!bookId) {
    return { error: "Khong tim thay sach can cap nhat." };
  }

  if (!title || !author) {
    return { error: "Ten sach va tac gia khong duoc de trong." };
  }

  const totalPages = Number(totalPagesRaw);
  if (!Number.isInteger(totalPages) || totalPages <= 0) {
    return { error: "Tong so trang phai la so nguyen duong." };
  }

  if (coverImageUrlRaw && !isValidUrl(coverImageUrlRaw)) {
    return { error: "URL anh bia khong hop le." };
  }

  const authSupabase = await createSupabaseServerClient();
  const { data: authData, error: authError } =
    await authSupabase.auth.getUser();
  if (authError || !authData.user) {
    return { error: "Ban can dang nhap de cap nhat sach." };
  }

  const supabase = await createSupabaseAdminClient();

  const { data: updatedRows, error: updateError } = await supabase
    .from("books")
    .update({
      title,
      author,
      total_pages: totalPages,
      cover_image_url: coverImageUrlRaw || null,
    })
    .eq("id", bookId)
    .select("*");

  if (updateError) {
    return { error: updateError.message };
  }

  if (!updatedRows || updatedRows.length === 0) {
    return {
      error:
        "Không cập nhật được sách. Hãy cấu hình SUPABASE_SERVICE_ROLE_KEY hoặc policy ghi cho bảng books.",
    };
  }

  let nextBook = updatedRows?.[0];

  if (!nextBook) {
    const { data: reloadedBook, error: reloadError } = await supabase
      .from("books")
      .select("*")
      .eq("id", bookId)
      .maybeSingle();

    if (!reloadError && reloadedBook) {
      nextBook = reloadedBook;
    }
  }

  if (!nextBook) {
    nextBook = {
      id: bookId,
      title,
      author,
      total_pages: totalPages,
      cover_image_url: coverImageUrlRaw || null,
      created_at: null,
    };
  }

  revalidatePath("/books");
  revalidatePath(`/books/${bookId}`);
  return { success: "Cap nhat sach thanh cong.", book: nextBook };
}

export async function deleteBookAction(
  _: BookMutationState,
  formData: FormData,
): Promise<BookMutationState> {
  const bookId = String(formData.get("book_id") ?? "").trim();
  if (!bookId) {
    return { error: "Không tìm thấy sách để xóa." };
  }

  const authSupabase = await createSupabaseServerClient();
  const { data: authData, error: authError } =
    await authSupabase.auth.getUser();
  if (authError || !authData.user) {
    return { error: "Bạn cần đăng nhập để xóa sách." };
  }

  const supabase = await createSupabaseAdminClient();

  const { error: logsError } = await supabase
    .from("reading_logs")
    .delete()
    .eq("book_id", bookId);

  if (logsError) {
    return { error: logsError.message };
  }

  const { data: deletedRows, error } = await supabase
    .from("books")
    .delete()
    .eq("id", bookId)
    .select("id");

  if (error) {
    return { error: error.message };
  }

  if (!deletedRows || deletedRows.length === 0) {
    return {
      error:
        "Không xóa được sách. Hãy cấu hình SUPABASE_SERVICE_ROLE_KEY hoặc policy ghi cho bảng books.",
    };
  }

  revalidatePath("/books");
  revalidatePath(`/books/${bookId}`);
  return { success: "Xóa sách thành công." };
}
