# DevOps Tools

A static GitHub Pages website for handy browser-based DevOps utilities.

The site is intended to be served from:

```text
https://devopstools.stanho.dev
```

## Included tools

- Secure password generator
- Base64 encoder and decoder
- SHA-256 hash generator
- UUID generator
- JSON formatter and minifier
- Unix timestamp converter
- URL encoder and decoder

All tools run locally in the browser. No values are sent to a server.

## Local preview

Because this is a static site, you can preview it by opening `index.html` in a
browser or by serving the repository folder with any static file server.

For example, if Python is installed:

```bash
python3 -m http.server 8080
```

Then open `http://localhost:8080`.

## Deployment

The GitHub Actions workflow in `.github/workflows/pages.yml` deploys the static
site to GitHub Pages when changes are pushed to `main`.

The repository includes a `CNAME` file for `devopstools.stanho.dev`. After the
workflow has deployed successfully, add the matching DNS record for that domain
in your DNS zone.
