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
    server: {
      watch: {
        // The BlobAdapter persists every save to `./data/*.json`.
        // Without this ignore, Vite picks up its own writes and
        // fires HMR, which reloads the admin every time the user
        // moves a section. Content edits should refresh the preview
        // iframe only, not the editor itself.
        ignored: ['**/data/**'],
      },
    },
  },
  server: {
    port: 4321,
  },
});
