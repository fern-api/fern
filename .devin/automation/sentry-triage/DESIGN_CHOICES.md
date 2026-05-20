# Triage design choices (compact)

One line per item. Append or edit **short** bullets when human review confirms a pattern; do not paste long prose. Principles here; **implementation lives in code and PRs**, not in this file.

## Choices

- User/environment syscalls (errno-style): classify at the **central** error-mapping layer **only** when the signal is a clear, code-level errno—not guessed from message text.
- Do **not** route “looks like X” string heuristics through that central layer; keep heuristics out or extremely narrow.
- Do **not** add central `isXError` classifiers except existing schema-validation / Node-version checks; parse/config/user errors should be explicit `CliError` codes at the boundary.
- User-authored content (docs, specs, config files): surface failures as **user-facing** parse/config/validation errors **at the boundary** where input enters the CLI—not as generic internal errors.
- Conversion or ingest steps on user input (format upgrades, parsers): failures should read as **user input problems**, with useful context when available.
- User configuration (versions, paths, generator references): wrong or invalid values → **config or validation** semantics, not internal errors.
- True product defects: **keep_sentry** in the ledger; do not hide them behind reclassification.
- Long-running or multi-step work: avoid **double reporting** (one failure should not become both a task failure and a top-level internal error).
- External service/job failures: surface as **non-reportable** service/network failures unless the CLI itself caused the defect.
- Subprocess / tool re-exec failures: prefer **abort or controlled failure** over a misleading internal error.
- Local tool failures from user worktrees/config (git, buf, sed): classify at the **tool boundary** as user/environment errors.
- Auth/AI/provider setup failures: classify at the **auth/config boundary**, not as generic internal errors.
- Pipe/TTY noise when users chain Unix tools: swallow or classify at the **I/O boundary** so it never looks like an app bug.
- If runtime minification or bundling can break **name-based** error checks, make classification rely on something **stable** (e.g. explicit names or codes), not fragile `constructor.name` alone.
