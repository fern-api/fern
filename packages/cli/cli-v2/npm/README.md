# NPM Distribution Layout

This directory holds the templates that drive `build.npm.mjs`. The script
assembles six publishable npm packages from the Bun-compiled binaries in
`dist/bin/`:

- **Wrapper** `@fern-api/fern` — `npm/wrapper/` is copied to `dist/npm/wrapper/`
  with `version` and `optionalDependencies` versions stamped at build time.
  It contains a tiny Node launcher (`bin/fern`) that resolves the platform-
  specific package and execs its binary.
- **Platform packages** `@fern-api/fern-<os>-<cpu>` — `npm/platform/` is the
  template; one copy per supported (os, cpu) pair is stamped out under
  `dist/npm/fern-<os>-<cpu>/`. Each contains a single binary and a
  `package.json` with `os` and `cpu` set so npm only installs the matching
  one when a user installs the wrapper.

This is the same layout used by `@bufbuild/buf`, `esbuild`, `@rollup/rollup-*`,
`@swc/core-*`, `lightningcss-*`, `@biomejs/biome`, and so on. See FER-8626 and
`docs/release-cli-v2.md` for details.
