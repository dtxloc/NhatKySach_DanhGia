import type { Metadata } from "next";
import { AuthForm } from "../_components/auth-form";
import { signUpAction } from "../actions";

export const metadata: Metadata = {
  title: "Đăng ký",
};

export default function RegisterPage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#f8fafc,_#e2e8f0_40%,_#cbd5e1)] px-4 py-12">
      <div className="mx-auto flex min-h-[calc(100vh-6rem)] max-w-6xl items-center justify-center">
        <AuthForm
          title="Tạo tài khoản"
          description="Đăng ký bằng email và mật khẩu để bắt đầu sử dụng Book Tracker."
          submitLabel="Đăng ký"
          mode="register"
          action={signUpAction}
          hintLinkLabel="Đã có tài khoản?"
          hintLinkHref="/auth/login"
        />
      </div>
    </main>
  );
}
