import type { APIRoute } from "astro";

export const prerender = false;

const AUTH_COOKIE = "starter_auth";

export const POST: APIRoute = async ({ cookies, redirect }) => {
  cookies.delete(AUTH_COOKIE, { path: "/" });
  return redirect("/admin/login");
};
