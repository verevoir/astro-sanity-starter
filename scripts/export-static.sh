#!/usr/bin/env bash
#
# export-static.sh — package the static portion of the build as a
# deployable tarball.
#
# The default build (`astro build`) produces both:
#   - dist/        — static HTML, CSS, JS, images
#   - .netlify/    — Netlify function code for /admin and /api/admin
#
# This script tarballs just dist/, giving you a static-only artifact
# you can drop on any object store (S3, GCS, R2, GitHub Pages,
# Cloudflare Pages, etc.). The admin won't function on a static host
# — that's expected — but the public site is fully prerendered HTML
# and works anywhere.
#
# Same source tree, two deploy targets, no config swap.

set -euo pipefail

OUT="${1:-static-build.tar.gz}"

if [[ ! -d dist ]]; then
  echo "✗ dist/ does not exist. Run \`npm run build\` first." >&2
  exit 1
fi

if [[ -z "$(ls -A dist 2>/dev/null)" ]]; then
  echo "✗ dist/ is empty. Run \`npm run build\` first." >&2
  exit 1
fi

# Tarball the contents of dist/, not dist itself, so consumers can
# extract directly into their web root.
tar -czf "$OUT" -C dist .

SIZE=$(du -h "$OUT" | cut -f1)
FILES=$(tar -tzf "$OUT" | wc -l | tr -d ' ')

echo "✓ $OUT ($SIZE, $FILES files)"
echo
echo "  This tarball contains the static portion of the build only."
echo "  Admin routes are NOT included — deploy with the Netlify"
echo "  adapter for a working admin, or treat the public site as"
echo "  read-only and edit content via git."
