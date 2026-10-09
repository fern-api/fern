# Contributing to Fern CLI SDK

We'd love to accept your patches and contributions to this project.

## Development setup

```bash
git clone https://github.com/fern-api/cli-sdk.git
cd cli-sdk
cargo build
cargo test
```

## Contribution process

All submissions, including submissions by project members, require review. We
use GitHub pull requests for this purpose.

### Changesets

Every PR must include a changeset file at `.changeset/<descriptive-name>.md`:

```markdown
---
"@fern-api/cli-sdk": patch
---

Brief description of the change
```

Use `patch` for fixes/chores, `minor` for new features, `major` for breaking changes.

### Input Validation & URL Safety

This CLI may be invoked by AI/LLM agents, so all user-supplied inputs must be treated as potentially adversarial. See [AGENTS.md](../AGENTS.md#input-validation--url-safety) for the full reference.

### Testing Expectations

- All new validation logic must include **both happy-path and error-path tests**
- Tests that modify the process CWD must use `#[serial]` from `serial_test`
- Tempdir paths should be canonicalized before use to handle macOS `/var` → `/private/var` symlinks
- Run the full suite before submitting: `cargo test && cargo clippy -- -D warnings`
