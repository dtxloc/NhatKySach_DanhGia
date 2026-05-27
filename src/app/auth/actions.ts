"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type AuthState = {
  error?: string;
  fieldErrors?: {
    email?: string;
    password?: string;
    confirmPassword?: string;
  };
};

function getValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function validateCredentials(email: string, password: string) {
  const fieldErrors: AuthState["fieldErrors"] = {};

  if (!email) {
    fieldErrors.email = "Vui lòng nhập email.";
  } else if (!/^\S+@\S+\.\S+$/.test(email)) {
    fieldErrors.email = "Email không hợp lệ.";
  }

  if (!password) {
    fieldErrors.password = "Vui lòng nhập mật khẩu.";
  } else if (password.length < 6) {
    fieldErrors.password = "Mật khẩu phải có ít nhất 6 ký tự.";
  }

  return fieldErrors;
}

export async function signInAction(
  _: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = getValue(formData, "email");
  const password = getValue(formData, "password");
  const fieldErrors = validateCredentials(email, password);

  if (Object.keys(fieldErrors).length > 0) {
    return { fieldErrors };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: error.message };
  }

  redirect("/");
}

export async function signUpAction(
  _: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = getValue(formData, "email");
  const password = getValue(formData, "password");
  const confirmPassword = getValue(formData, "confirmPassword");
  const fieldErrors = validateCredentials(email, password);

  if (!confirmPassword) {
    fieldErrors.confirmPassword = "Vui lòng xác nhận mật khẩu.";
  } else if (password && confirmPassword !== password) {
    fieldErrors.confirmPassword = "Xác nhận mật khẩu không khớp.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { fieldErrors };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/auth/login`,
    },
  });

  if (error) {
    return { error: error.message };
  }

  redirect("/auth/login?message=check-email");
}

export async function signOutAction() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/auth/login");
}
