# DevOps Tools

A dependency-free static site (plain HTML/CSS/JS) with browser-based DevOps utilities. See `README.md` for the tool list and deployment details.

## Cursor Cloud specific instructions

- There are no dependencies, build step, tests, or lint tooling. The "dev environment" is just serving the static files.
- Run locally with a static file server from the repo root: `python3 -m http.server 8080`, then open `http://localhost:8080`. Python 3 is preinstalled.
- All tools run client-side (they use browser Web Crypto APIs like `crypto.subtle` / `crypto.randomUUID`), so they must be exercised in a real browser, not via `curl`. Some APIs (e.g. `crypto.subtle`, clipboard) require a secure context; `http://localhost` counts as secure.
- Deployment is handled by `.github/workflows/pages.yml` (GitHub Pages on push to `main`); no manual build is needed.
