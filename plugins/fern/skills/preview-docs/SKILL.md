---
name: preview-docs
description: Run a local Fern documentation preview server. Use this when the user wants to see what their Fern docs site looks like before publishing, asks to "preview the docs", or wants to iterate on `docs.yml`, MDX pages, or API reference styling locally.
---

# Preview a Fern docs site locally

`fern docs dev` boots a local server that renders the docs site exactly as
it will appear on production. It watches `docs.yml`, MDX pages, and the
referenced API spec so edits hot-reload.

## Pre-flight

1. Confirm there is a Fern project with a `fern/docs.yml`. If `docs.yml` does
   not exist, invoke the `scaffold-docs-site` skill first.

2. Confirm the `fern` CLI is available:
   ```bash
   fern --version
   ```

## Run the preview

```bash
fern docs dev
```

By default the server listens on `http://localhost:3000`. To pick a different
port:

```bash
fern docs dev --port 4000
```

The first run downloads the docs bundle, which can take 30–60 seconds. Tell
the user this so they do not interrupt it.

## What to report

Once the server prints a "Ready" / "listening on" line, surface the URL to
the user verbatim — they will click it. Do not embed the URL in markdown
that the terminal may not render.

Leave the server running in the foreground. If the user asks to stop it,
send SIGINT (Ctrl+C). Do not background the process unless the user asks —
they need to see compile errors in the docs as they edit.

## Troubleshooting

- **Port already in use**: re-run with `--port <other-port>`.
- **`docs.yml` parse errors**: run `fern docs check` to surface the exact
  line / column.
- **API reference looks empty**: the docs config probably references an API
  name that does not match `generators.yml`. Check `instances:` and
  `navigation:` entries in `docs.yml`.
- **Hot reload not picking up changes**: confirm the file is inside
  `fern/pages/` or referenced from `docs.yml`. Files elsewhere are ignored.
