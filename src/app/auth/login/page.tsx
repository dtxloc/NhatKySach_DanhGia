import type { Metadata } from "next";
import { AuthForm } from "../_components/auth-form";
import { signInAction } from "../actions";

export const metadata: Metadata = {
  title: "Đăng nhập",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const initialMessage =
    resolvedSearchParams?.message === "check-email"
      ? "Hãy kiểm tra email để xác nhận tài khoản."
      : undefined;

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#f8fafc,_#e2e8f0_40%,_#cbd5e1)] px-4 py-12">
      <div className="mx-auto flex min-h-[calc(100vh-6rem)] max-w-6xl items-center justify-center">
        <AuthForm
          title="Chào mừng trở lại"
          description="Đăng nhập để tiếp tục theo dõi hành trình đọc sách của bạn."
          submitLabel="Đăng nhập"
          mode="login"
          action={signInAction}
          hintLinkLabel="Chưa có tài khoản?"
          hintLinkHref="/auth/register"
          initialMessage={initialMessage}
        />
      </div>
    </main>
  );
}
