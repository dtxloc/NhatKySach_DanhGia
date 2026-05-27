"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
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

type AuthState = {
  error?: string;
  fieldErrors?: {
    email?: string;
    password?: string;
    confirmPassword?: string;
  };
};

type AuthFormProps = {
  title: string;
  description: string;
  submitLabel: string;
  mode: "login" | "register";
  action: (prevState: AuthState, formData: FormData) => Promise<AuthState>;
  hintLinkLabel: string;
  hintLinkHref: string;
  initialMessage?: string;
};

const initialState: AuthState = {};

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? "Đang xử lý..." : label}
    </Button>
  );
}

export function AuthForm({
  title,
  description,
  submitLabel,
  mode,
  action,
  hintLinkLabel,
  hintLinkHref,
  initialMessage,
}: AuthFormProps) {
  const [state, formAction] = useActionState(action, initialState);

  return (
    <Card className="w-full max-w-md border-slate-200 bg-white/95 shadow-xl backdrop-blur">
      <CardHeader className="space-y-2">
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-5">
          {initialMessage ? (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {initialMessage}
            </div>
          ) : null}

          {state.error ? (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {state.error}
            </div>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              required
            />
            {state.fieldErrors?.email ? (
              <p className="text-sm text-red-600">{state.fieldErrors.email}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Mật khẩu</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              required
            />
            {state.fieldErrors?.password ? (
              <p className="text-sm text-red-600">
                {state.fieldErrors.password}
              </p>
            ) : null}
          </div>

          {mode === "register" ? (
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Xác nhận mật khẩu</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="••••••••"
                required
              />
              {state.fieldErrors?.confirmPassword ? (
                <p className="text-sm text-red-600">
                  {state.fieldErrors.confirmPassword}
                </p>
              ) : null}
            </div>
          ) : null}

          <SubmitButton label={submitLabel} />
        </form>

        <p className="mt-5 text-center text-sm text-slate-600">
          {hintLinkLabel}{" "}
          <Link
            href={hintLinkHref}
            className="font-medium text-slate-900 underline underline-offset-4"
          >
            {mode === "login" ? "Đăng ký" : "Đăng nhập"}
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
