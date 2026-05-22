import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import { getSupabaseEnv, hasSupabaseEnv } from "./env";

export async function updateSession(request: NextRequest) {
  if (!hasSupabaseEnv()) return NextResponse.next({ request });

  let response = NextResponse.next({ request });

  const { url: supabaseUrl, key: supabaseKey } = getSupabaseEnv();
  const supabase = createServerClient(supabaseUrl, supabaseKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const protectedPath = [
    "/dashboard",
    "/properties",
    "/bookings",
    "/guests",
    "/calendar",
    "/notifications",
    "/cleaning",
    "/maintenance",
    "/owners",
    "/reports",
    "/admin",
    "/settings",
    "/account",
    "/owner-dashboard",
    "/cleaner-dashboard",
    "/maintenance-dashboard",
    "/owner",
    "/field",
    "/guest",
  ].some((path) => request.nextUrl.pathname.startsWith(path));

  if (!user && protectedPath) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  if (user && protectedPath) {
    const { data: membership } = await supabase
      .from("memberships")
      .select("role")
      .eq("user_id", user.id)
      .eq("status", "active")
      .limit(1)
      .maybeSingle();
    const role = String(membership?.role ?? "");
    const pathname = request.nextUrl.pathname;
    const roleAccess: Array<[string, string[]]> = [
      ["/owner", ["platform_admin", "workspace_admin", "manager", "owner"]],
      ["/owner-dashboard", ["platform_admin", "workspace_admin", "manager", "owner"]],
      ["/field/cleaning", ["platform_admin", "workspace_admin", "manager", "cleaner"]],
      ["/cleaner-dashboard", ["platform_admin", "workspace_admin", "manager", "cleaner"]],
      [
        "/field/maintenance",
        ["platform_admin", "workspace_admin", "manager", "maintenance_tech"],
      ],
      [
        "/maintenance-dashboard",
        ["platform_admin", "workspace_admin", "manager", "maintenance_tech"],
      ],
      ["/guest", ["platform_admin", "workspace_admin", "manager", "guest"]],
      ["/admin", ["platform_admin"]],
    ];
    const rule = roleAccess.find(([path]) => pathname.startsWith(path));
    if (rule && !rule[1].includes(role)) {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard";
      url.searchParams.set("denied", pathname);
      return NextResponse.redirect(url);
    }
  }

  return response;
}
