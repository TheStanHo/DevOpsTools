# DevOps Tools

A static GitHub Pages website for handy browser-based DevOps utilities.

The site is intended to be served from:

```text
https://devopstools.stanho.dev
```

## Included tools

### Security
- Secure password generator
- UUID generator
- JWT decoder (with expiry / `nbf` warnings)
- Hash generator (MD5, SHA-1, SHA-256, SHA-384, SHA-512)
- PEM / certificate decoder

### Data & config
- Base64 encoder and decoder
- URL encoder and decoder
- Query string ↔ JSON converter
- JSON formatter and minifier
- YAML lint / format (js-yaml parser)
- Text diff with colorized output

### Time & scheduling
- Unix timestamp converter with timezone display
- Cron schedule helper (5-field and 6-field, timezone-aware next runs)

### Network & debugging
- CIDR calculator (IPv4 and IPv6)
- Subnet overlap checker
- Regex tester
- HTTP status / header helper
- kubectl / docker command explainer

All tools run locally in the browser. No values are sent to a server.

## Features

- Searchable tool sidebar (`/` to focus search)
- Light and dark themes
- Mobile tool drawer
- Keyboard shortcuts (`?` for help)
- Swap / clear / sample actions on common converters
- Open Graph metadata for sharing

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
