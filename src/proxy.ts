import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import type { Database } from "@/types/supabase";
import { getSupabaseEnv } from "@/lib/supabase/env";

export async function proxy(request: NextRequest) {
  const response = NextResponse.next({ request });
  const { supabaseUrl, supabaseAnonKey } = getSupabaseEnv();
  const supabaseCookies = request.cookies
    .getAll()
    .filter((cookie) => cookie.name.startsWith("sb-"));

  const supabase = createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  const { error } = await supabase.auth.getUser();

  if (error) {
    supabaseCookies.forEach((cookie) => {
      response.cookies.set(cookie.name, "", {
        path: "/",
        maxAge: 0,
      });
    });
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
