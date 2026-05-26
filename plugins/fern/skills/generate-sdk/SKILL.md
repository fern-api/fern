---
name: generate-sdk
description: Generate an SDK for an existing Fern project using `fern sdk generate`. Use this when the user asks to generate or rebuild an SDK in a specific language (TypeScript, Python, Java, Go, Ruby, C#, PHP, Rust, Swift), or wants to add a new SDK target to a Fern project.
---

# Generate an SDK with Fern

You drive `fern sdk generate` to produce a language SDK from the Fern project
in the current directory. Fern supports TypeScript, Python, Java, Go, Ruby,
C#, PHP, Rust, and Swift.

## Pre-flight

1. Confirm there is a Fern project in the current directory or a parent.
   The marker is `fern.config.json`. If you cannot find one, invoke the
   `init-fern-project` skill first instead of trying to guess.

2. Confirm the `fern` CLI is available:

   ```bash
   fern --version
   ```

3. If the user has not specified a target language, ask. Do not pick one for
   them — generating the wrong SDK is wasteful.

## Add the generator (only if missing)

If `generators.yml` does not yet contain the target language, add it:

```bash
fern sdk add --target <language>
```

`<language>` is one of: `typescript`, `python`, `java`, `go`, `ruby`,
`csharp`, `php`, `rust`, `swift`.

## Generate

Run the generator. For local-only output (recommended for first-time setup):

```bash
fern sdk generate --target <language> --local
```

For publishing to a registry (npm, PyPI, Maven, NuGet, RubyGems, etc.), drop
`--local` and make sure the corresponding `output` block in `generators.yml`
points at the right registry. Publishing usually needs `fern auth login`
first — check `fern auth status` and prompt the user to log in if needed.

To generate every group defined in `generators.yml`:

```bash
fern sdk generate
```

## Verify

After generation, inspect the output directory listed in `generators.yml`
(commonly `./sdks/<language>/` or similar) and tell the user:

- Where the SDK was written
- How to install / publish it
- Any compile or test commands the generated README mentions

If generation fails, run `fern check` first to surface configuration errors
before debugging the generator itself.
