import { redirect } from "next/navigation";
import { SiteHeader } from "@/components/layout/site-header";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { CreateBookForm } from "../_components/create-book-form";

export default async function NewBookPage() {
  const supabase = await createSupabaseServerClient();
  const { data: authData } = await supabase.auth.getUser();

  if (!authData.user) {
    redirect("/auth/login");
  }

  return (
    <>
      <SiteHeader userEmail={authData.user.email ?? ""} />
      <main className="min-h-[calc(100vh-4rem)] bg-[radial-gradient(circle_at_top,_#f8fafc,_#e2e8f0_50%,_#cbd5e1)] px-4 py-10">
        <div className="mx-auto max-w-3xl">
          <CreateBookForm />
        </div>
      </main>
    </>
  );
}
