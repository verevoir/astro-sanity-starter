import { defineMiddleware } from "astro:middleware";
import { resolveIdentity, type Identity } from "@/access";

/**
 * Starter auth middleware.
 *
 * Resolves the auth cookie into an identity on every request and
 * puts the result on `context.locals.identity`. Routes that want to
 * branch on auth read `Astro.locals.identity` (in .astro files) or
 * `context.locals.identity` (in API routes).
 *
 * Gates `/admin/*` and `/api/admin/*` — unauthenticated requests
 * there get redirected to the login page. Login and logout routes
 * themselves are excluded from the gate (you can't log in without
 * reaching login).
 *
 * Everything outside those prefixes — the public site — is
 * untouched.
 */

const AUTH_COOKIE = "starter_auth";
const PROTECTED_PREFIXES = ["/admin", "/api/admin"];
const GATE_BYPASS = ["/admin/login", "/api/admin/login", "/api/admin/logout"];

export const onRequest = defineMiddleware(async (context, next) => {
  const token = context.cookies.get(AUTH_COOKIE)?.value;
  const identity = await resolveIdentity(token);
  context.locals.identity = identity ?? undefined;

  const path = context.url.pathname;
  const isProtected = PROTECTED_PREFIXES.some((p) => path.startsWith(p));
  const isBypass = GATE_BYPASS.includes(path);

  if (isProtected && !isBypass && !identity) {
    const returnTo = context.url.pathname + context.url.search;
    return context.redirect(
      `/admin/login?returnTo=${encodeURIComponent(returnTo)}`,
    );
  }

  return next();
});

declare global {
  namespace App {
    interface Locals {
      identity?: Identity;
    }
  }
}
