"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { ReadingStatus, Tables } from "@/types/supabase";

export type UpdateReadingLogInput = {
  logId: string;
  currentPage: number;
  status: ReadingStatus;
  reviewText?: string | null;
  rating?: number | null;
};

export type UpdateReadingLogState = {
  error?: string;
  success?: boolean;
};

export type CreateReadingLogState = {
  error?: string;
  success?: boolean;
};

export type DeleteReadingLogState = {
  error?: string;
  success?: boolean;
};

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}

function validateUpdateInput(input: UpdateReadingLogInput) {
  if (!isUuid(input.logId)) {
    return "ID nhật ký không hợp lệ.";
  }

  return validateReadingValues(input.currentPage, input.status, input.rating);
}

function validateReadingValues(
  currentPage: number,
  status: ReadingStatus,
  rating: number | null | undefined,
) {
  if (!Number.isInteger(currentPage) || currentPage < 0) {
    return "Số trang hiện tại không hợp lệ.";
  }

  if (!["want_to_read", "reading", "finished", "paused"].includes(status)) {
    return "Trạng thái không hợp lệ.";
  }

  if (rating !== undefined && rating !== null) {
    if (typeof rating !== "number" || rating < 0 || rating > 5) {
      return "Đánh giá phải nằm trong khoảng từ 0 đến 5.";
    }
  }

  return null;
}

export async function updateReadingLogAction(
  _: UpdateReadingLogState,
  formData: FormData,
): Promise<UpdateReadingLogState> {
  const logId = String(formData.get("logId") ?? "");
  const currentPage = Number(formData.get("currentPage"));
  const status = String(formData.get("status") ?? "") as ReadingStatus;
  const reviewText = String(formData.get("reviewText") ?? "").trim();
  const rawRating = formData.get("rating");
  const rating =
    rawRating === null || rawRating === "" ? null : Number(rawRating);

  const validationError = validateUpdateInput({
    logId,
    currentPage,
    status,
    reviewText,
    rating,
  });

  if (validationError) {
    return { error: validationError };
  }

  const supabase = await createSupabaseServerClient();
  const { data: authData, error: authError } = await supabase.auth.getUser();

  if (authError || !authData.user) {
    return { error: "Bạn cần đăng nhập để cập nhật nhật ký." };
  }

  const userId = authData.user.id;

  const payload: Tables["reading_logs"]["Update"] = {
    current_page: currentPage,
    status,
    review_text: reviewText || null,
    rating,
  };

  const { error } = await supabase
    .from("reading_logs")
    .update(payload)
    .eq("id", logId)
    .eq("user_id", userId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/reading-logs");
  return { success: true };
}

export async function createReadingLogAction(
  _: CreateReadingLogState,
  formData: FormData,
): Promise<CreateReadingLogState> {
  const bookId = String(formData.get("bookId") ?? "").trim();
  const status = String(formData.get("status") ?? "") as ReadingStatus;
  const currentPage = Number(formData.get("currentPage"));
  const reviewText = String(formData.get("reviewText") ?? "").trim();
  const rawRating = formData.get("rating");
  const rating =
    rawRating === null || rawRating === "" ? null : Number(rawRating);

  if (!isUuid(bookId)) {
    return { error: "Sach duoc chon khong hop le." };
  }

  const validationError = validateReadingValues(currentPage, status, rating);

  if (validationError) {
    return { error: validationError };
  }

  const supabase = await createSupabaseServerClient();
  const { data: authData, error: authError } = await supabase.auth.getUser();

  if (authError || !authData.user) {
    return { error: "Ban can dang nhap de tao nhat ky." };
  }

  const { error } = await supabase.from("reading_logs").insert({
    user_id: authData.user.id,
    book_id: bookId,
    status,
    current_page: currentPage,
    review_text: reviewText || null,
    rating,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/reading-logs");
  return { success: true };
}

export async function deleteReadingLogAction(
  _: DeleteReadingLogState,
  formData: FormData,
): Promise<DeleteReadingLogState> {
  const logId = String(formData.get("logId") ?? "").trim();
  if (!isUuid(logId)) {
    return { error: "ID nhật ký không hợp lệ." };
  }

  const supabase = await createSupabaseServerClient();
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (!authData.user) {
    return {
      error: authError?.message ?? "Bạn cần đăng nhập để xóa nhật ký.",
    };
  }

  const { error } = await supabase
    .from("reading_logs")
    .delete()
    .eq("id", logId)
    .eq("user_id", authData.user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/reading-logs");
  return { success: true };
}
