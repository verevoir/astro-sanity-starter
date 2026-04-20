import type { APIRoute } from "astro";

export const prerender = false;

const AUTH_COOKIE = "starter_auth";
const WEEK_SECONDS = 60 * 60 * 24 * 7;

/**
 * Accept a form POST from /admin/login and set the auth cookie.
 *
 * In dev the token is whatever the login form selects — it matches
 * a test account registered in src/access/index.ts. When you swap
 * for real auth the cookie still holds a token; it just comes from
 * an OAuth callback or similar rather than a dropdown.
 */
export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  const form = await request.formData();
  const token = form.get("token")?.toString();
  const returnTo = form.get("returnTo")?.toString() ?? "/admin";

  if (!token) {
    return new Response("Missing token", { status: 400 });
  }

  cookies.set(AUTH_COOKIE, token, {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: import.meta.env.PROD,
    maxAge: WEEK_SECONDS,
  });

  return redirect(returnTo);
};
