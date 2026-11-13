import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;

  if (!user && path.startsWith("/admin") && path !== "/admin/login") {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    return NextResponse.redirect(url);
  }

  if (user) {
    const role = (user.user_metadata as { role?: string } | undefined)?.role;
    // Garçom só pode acessar a área de mesas/comandas: sem cardápio,
    // configurações, pedidos completos (com dados do cliente) nem a
    // ferramenta de privacidade/LGPD.
    if (
      role === "garcom" &&
      path.startsWith("/admin") &&
      path !== "/admin/login" &&
      !path.startsWith("/admin/mesas")
    ) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin/mesas";
      return NextResponse.redirect(url);
    }
  }

  return response;
}
