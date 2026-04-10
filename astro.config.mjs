import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import react from "@astrojs/react";
import netlify from "@astrojs/netlify";

// Hybrid output: most pages stay static, /admin/* are server-rendered
// via Netlify functions. The same build can be deployed to any static
// host (just upload dist/) — admin won't function without the adapter,
// but everything else does.
export default defineConfig({
  output: "static",
  adapter: netlify(),
  integrations: [react()],
  vite: {
    plugins: [tailwindcss()],
  },
  server: {
    port: 3000,
  },
});
