import { storage } from "./storage";

export async function seed() {
  const existing = await storage.list("siteConfig");
  if (existing.length > 0) return;

  // Site config — matches the shape Layout.astro expects
  await storage.create("siteConfig", {
    favicon: { src: "/favicon.svg" },
    header: {
      title: "Verevoir",
      logo: {
        src: "/images/verevoir-wide.svg",
        alt: "Verevoir",
        dimensions: { width: 152, height: 50 },
      },
      navLinks: [
        { _type: "actionLink", label: "Features", url: "#features" },
        {
          _type: "actionLink",
          label: "GitHub",
          url: "https://github.com/verevoir",
        },
        {
          _type: "actionButton",
          label: "Get Started",
          url: "https://verevoir.io",
          theme: "primary",
        },
      ],
    },
    footer: {
      text: "Built with [Astro](https://astro.build) and [Verevoir](https://verevoir.io). Open source on [GitHub](https://github.com/verevoir).",
    },
    titleSuffix: "Verevoir Starter",
  });

  // Home page with composable sections. status='published' so the
  // public renderer's isLive() check passes for the seeded content
  // — without it, every freshly-cloned starter would 404 the home
  // page until the user discovered the publish workflow.
  await storage.create("page", {
    title: "Home",
    slug: "/",
    status: "published",
    tags: [],
    addTitleSuffix: true,
    metaTitle: "Verevoir — Content, Commerce & Editing as Composable Libraries",
    metaDescription:
      "A lightweight alternative to monolithic CMS platforms. You own the database, the deployment, and the data.",
    sections: [
      // Hero
      {
        _type: "heroSection",
        heading: "Your content, your database, your rules",
        body: "Verevoir is a set of composable TypeScript libraries for structured content, commerce, and editing. No hosted backend, no vendor lock-in — just **npm packages** in your app.",
        cta: [
          {
            _type: "actionButton",
            label: "Get Started",
            url: "https://verevoir.io",
            theme: "primary",
          },
          {
            _type: "actionLink",
            label: "View on GitHub",
            url: "https://github.com/verevoir",
          },
        ],
        theme: "dark",
        width: "full",
      },

      // Benefits cards — each links to the supporting npm package or
      // doc rather than a fictional source. Drop-in for the testimonials
      // section that used to live below; same conceptual job (here's
      // what's good about Verevoir) without the credibility cost of
      // fake quotes.
      {
        _type: "cardsSection",
        heading: "Why Verevoir?",
        body: "Composable libraries for the parts of an app a hosted CMS would lock you into. Each card links to the package or doc that proves it out.",
        columns: "three",
        items: [
          {
            heading: "TypeScript-first schemas",
            body: "Define content shapes with `defineBlock()`. Get validators, types, and editor hints — all from one definition.",
            ctaLabel: "Read the schema docs",
            ctaUrl: "https://www.npmjs.com/package/@verevoir/schema",
            badge: { label: "Schema engine", theme: "primary" },
            theme: "light",
            textAlign: "center",
            hasBorder: true,
          },
          {
            heading: "Pick your database",
            body: "Postgres today, SQLite tomorrow, filesystem for git-tracked content. The `StorageAdapter` interface lets you swap without touching the rest of the app.",
            ctaLabel: "Storage on npm",
            ctaUrl: "https://www.npmjs.com/package/@verevoir/storage",
            badge: { label: "Storage", theme: "secondary" },
            theme: "light",
            textAlign: "center",
            hasBorder: true,
          },
          {
            heading: "Drop-in editor",
            body: "Lightweight React components — fields, sections, smart datetime, tag scheduler — ready to embed in your admin.",
            ctaLabel: "Editor on npm",
            ctaUrl: "https://www.npmjs.com/package/@verevoir/editor",
            badge: { label: "Editor", theme: "accent" },
            theme: "light",
            textAlign: "center",
            hasBorder: true,
          },
          {
            heading: "Auth + access control",
            body: "Google, Apple, OIDC, API keys. Role-based policies, persistent role assignments, workflow state machines — all composable.",
            ctaLabel: "Access on npm",
            ctaUrl: "https://www.npmjs.com/package/@verevoir/access",
            badge: { label: "Access", theme: "primary" },
            theme: "light",
            textAlign: "center",
            hasBorder: true,
          },
          {
            heading: "Commerce included",
            body: "Products, baskets, orders, subscriptions. Pluggable pricing and tax engines. Stripe adapter as a separate package — bring or skip.",
            ctaLabel: "Commerce on npm",
            ctaUrl: "https://www.npmjs.com/package/@verevoir/commerce",
            badge: { label: "Commerce", theme: "secondary" },
            theme: "light",
            textAlign: "center",
            hasBorder: true,
          },
          {
            heading: "No vendor lock-in",
            body: "The data lives where you put it. Migrate from a hosted CMS via an adapter, dual-write, then cut over — no big-bang rewrite.",
            ctaLabel: "How to migrate",
            ctaUrl:
              "https://github.com/verevoir/astro-sanity-starter/blob/main/docs/from-headless-cms.md",
            badge: { label: "Philosophy", theme: "accent" },
            theme: "light",
            textAlign: "center",
            hasBorder: true,
          },
        ],
        theme: "light",
        width: "full",
      },

      // Logos
      {
        _type: "logosSection",
        heading: "Built on standards you know",
        items: [
          {
            src: "/images/logo-typescript.svg",
            alt: "TypeScript",
            dimensions: { width: 120, height: 40 },
          },
          {
            src: "/images/logo-react.svg",
            alt: "React",
            dimensions: { width: 120, height: 40 },
          },
          {
            src: "/images/logo-nextjs.svg",
            alt: "Next.js",
            dimensions: { width: 120, height: 40 },
          },
          {
            src: "/images/logo-astro.svg",
            alt: "Astro",
            dimensions: { width: 120, height: 40 },
          },
          {
            src: "/images/logo-postgres.svg",
            alt: "PostgreSQL",
            dimensions: { width: 120, height: 40 },
          },
          {
            src: "/images/logo-stripe.svg",
            alt: "Stripe",
            dimensions: { width: 120, height: 40 },
          },
        ],
        motion: "moveToLeft",
        theme: "light",
        width: "full",
      },

      // CTA
      {
        _type: "ctaSection",
        heading: "Ready to own your stack?",
        body: "Verevoir is open source and free to use. Start with one package, adopt more as you need them.",
        cta: [
          {
            _type: "actionButton",
            label: "Read the Docs",
            url: "https://verevoir.io",
            theme: "primary",
          },
          {
            _type: "actionLink",
            label: "Browse Packages on npm",
            url: "https://www.npmjs.com/org/verevoir",
          },
        ],
        theme: "light",
        width: "inset",
      },
    ],
  });
}
