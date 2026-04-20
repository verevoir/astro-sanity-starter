# Theme the website

The starter ships with a dark glass aesthetic on the admin (`src/styles/admin-theme.css`). The public site uses Tailwind + DaisyUI with `data-theme="light"`. Here's how to port the admin vibe to the public side without fighting Tailwind.

> Status: this doc describes a pattern we've lightly proved but haven't fully wired through. Treat as a recipe you'll iterate on rather than a paved path.

## What to port vs what not to

**Port:** the palette, the gradient background, the glass surface treatment, the Mulish type.

**Don't port:** the admin's `data-*` component selectors. They're tied to admin components you don't have on the public side.

## The approach

Three moving pieces:

1. A shared stylesheet of design tokens (CSS custom properties) — lives in `src/styles/tokens.css`.
2. A DaisyUI theme that references those tokens — lives in `src/styles/globals.css`.
3. Optional utility classes for reusable treatments (glass surface, etc.).

Tailwind's `@theme inline` lets you expose the same tokens as Tailwind colour utilities, so markup like `bg-primary` picks them up automatically.

## 1. Extract tokens

Create `src/styles/tokens.css`:

```css
:root {
  /* Palette */
  --color-ink: #f5f0ff;
  --color-ink-muted: rgba(245, 240, 255, 0.65);
  --color-accent: #ffae9c;
  --color-surface: rgba(255, 255, 255, 0.06);
  --color-surface-raised: rgba(255, 255, 255, 0.1);
  --color-border: rgba(255, 255, 255, 0.14);

  /* Depth */
  --shadow-glass: 0 10px 30px -12px rgba(0, 0, 0, 0.5);
  --blur-glass: blur(20px) saturate(140%);
}
```

## 2. Wire DaisyUI + Tailwind

Edit `src/styles/globals.css`:

```css
@import "tailwindcss";
@import "./tokens.css";
@plugin "daisyui";

@plugin "daisyui/theme" {
  name: "glass";
  --color-primary: var(--color-accent);
  --color-primary-content: #171227;
  --color-base-100: transparent;
  --color-base-200: var(--color-surface);
  --color-base-content: var(--color-ink);
}

/* Body background: the two-layer gradient from the admin theme. */
body[data-theme="glass"] {
  background:
    radial-gradient(ellipse 60% 70% at 50% 22%, #26267b 0%, #20207499 68%, #06063d00 100%),
    radial-gradient(ellipse 60% 15% at 50% 95%, #26267b 0%, #06063d 100%);
  background-attachment: fixed;
  color: var(--color-ink);
}
```

Switch the layout:

```astro
<!-- src/layouts/Layout.astro -->
<html lang="en" data-theme="glass">
```

## 3. Add a glass utility

```css
/* in globals.css */
.glass {
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.12),
    rgba(255, 255, 255, 0.04)
  );
  backdrop-filter: var(--blur-glass);
  -webkit-backdrop-filter: var(--blur-glass);
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-glass);
  border-radius: 0.75rem;
}
```

Apply to any container that should read as a floating glass panel:

```astro
<section class="glass p-8">...</section>
```

## 4. Sprinkle, don't rewrite

Don't convert every page at once. Pick a section — the hero, or the testimonials — and swap its background to `glass`. See how it reads. Iterate.

## Keeping the light theme available

If you want users (or yourself) to be able to flip between glass and the original light/dark DaisyUI themes, leave the existing `@plugin "daisyui/theme" { name: "light" }` blocks in place and toggle `data-theme` on `<html>` via a theme switcher. Both themes reference the same DaisyUI structure; only the variables differ.

## Later: extracting to a package

If you find yourself using the same tokens + `.glass` utility in multiple projects, lift them into a shared stylesheet (a small `@verevoir/theme-glass` package, or a CSS file you copy between projects). No rush — the starter's local file is fine until there's a second consumer.
