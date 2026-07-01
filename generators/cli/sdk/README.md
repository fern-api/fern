# Fern CLI Generator — SDK runtime

This directory is the **canonical source** for the Fern CLI generator
runtime (the Rust crate that powers generated CLIs). Edit it directly here.

## History

This tree used to be a one-way vendored snapshot of
[`fern-api/cli-sdk`](https://github.com/fern-api/cli-sdk), updated by a daily
sync. As of the cli-sdk sunset (FER-11468), **`fern-api/cli-sdk` is archived**
and development moved into this directory. There is no upstream to sync from
anymore — changes made here are the source of truth.

## Working here

See [`../CLAUDE.md`](../CLAUDE.md) for the generator architecture, the
develop/test loop, and the build/rebuild steps.

Two leftovers from the old sync are now maintained by hand:

- **`.sdk-ignore.json`** — dev-only globs excluded from customer output by
  `build.mjs`. Add a glob here for any file under this tree that should not
  ship in generated CLIs.
- **`.synced-from`** — the final `cli-sdk@<sha>` that was vendored, kept for
  provenance.
