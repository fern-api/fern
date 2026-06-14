# CLI-V2 Package

The next-generation Fern CLI, built on yargs with a class-based command architecture.

## Command Structure

Commands use one of three registration patterns from `src/commands/_internal/`:

### Leaf Command (`command()` helper)
Single command with no subcommands. This is the most common pattern.

```typescript
export declare namespace SplitCommand {
    export interface Args extends GlobalArgs {
        api?: string;
        format?: SplitFormatInput;
    }
}

export class SplitCommand {
    public async handle(context: Context, args: SplitCommand.Args): Promise<void> {
        // ...
    }

    private async splitAsOverlay(/* ... */): Promise<void> {
        // Private helpers for internal logic
    }
}

export function addSplitCommand(cli: Argv<GlobalArgs>): void {
    const cmd = new SplitCommand();
    command(
        cli,
        "split",
        "Description shown in help",
        (context, args) => cmd.handle(context, args as SplitCommand.Args),
        (yargs) =>
            yargs
                .option("api", { type: "string", description: "Filter by API name" })
                .option("format", { type: "string", default: "overlay" })
    );
}
```

### Command Group (`commandGroup()` helper)
Routes to required subcommands, no default handler.

```typescript
export function addAuthCommand(cli: Argv<GlobalArgs>): void {
    commandGroup(cli, "auth", "Authenticate fern", [
        addLoginCommand,
        addLogoutCommand,
        addStatusCommand
    ]);
}
```

### Command with Subcommands (`commandWithSubcommands()` helper)
Has both a default handler AND subcommands (git-stash pattern).

```typescript
commandWithSubcommands(cli, "preview", "Preview docs", handler, builder, [addDeleteCommand]);
```

## Key Conventions

- **Class-based handlers**: Commands are classes with a public `handle(context, args)` method. Private methods for internal logic. The class is instantiated once in the `add*Command` registration function.
- **Args via declare namespace**: Each command declares its args interface inside a `declare namespace` block extending `GlobalArgs`.
- **File naming**: `command.ts` for implementation, `index.ts` for single-line re-export, `__test__/` for tests alongside source.
- **Import paths**: Always use `.js` extensions (ESM). Use `@fern-api/*` for workspace packages, relative paths within this package.
- **Context-first**: All handlers receive `Context` as first argument — provides logging, workspace loading, auth, telemetry, and shutdown hooks.
- **Errors**: Throw `CliError` (with static factories like `CliError.authRequired()`, `CliError.notFound()`). Never swallow errors silently.
- **UI output**: Use `Icons.success`/`Icons.error` from `ui/format.ts` with `chalk` for colored output. Info/debug to `context.stderr`, structured output to `context.stdout`.

## Testing

```typescript
// Silent context for logic tests
const context = createTestContext({ cwd: AbsoluteFilePath.of(testDir) });

// Context with output capture for asserting messages
const { context, getStdout, getStderr } = createTestContextWithCapture({ cwd });
await cmd.handle(context, args);
expect(getStderr()).toContain("expected message");
```

Test utilities live in `src/__test__/utils/`. Command tests live in `src/commands/*/__test__/`.

## Releasing

CLI v2 ships as **platform-specific native binaries** distributed via npm and GitHub Releases.

### Layout

```
@fern-api/fern                                    # wrapper (thin Node launcher)
@fern-api/fern-darwin-arm64                       # platform packages
@fern-api/fern-darwin-x64                         #   one per supported OS/arch
@fern-api/fern-linux-arm64                        #   pinned to the same version
@fern-api/fern-linux-x64                          #   as the wrapper
@fern-api/fern-win32-x64
```

`bun build --compile` produces one self-contained binary per platform from
`dist/dev/cli.cjs`. The wrapper has the five platform packages as
`optionalDependencies` with `os`/`cpu` fields set, so npm installs only the
package matching the current platform. The wrapper's `bin/fern` Node launcher
resolves `@fern-api/fern-<os>-<cpu>/bin/fern[.exe]` and execs it. This is the
same pattern used by `@bufbuild/buf`, `esbuild`, `@rollup/rollup-*`, and
`@swc/core-*`.

Build pipeline:

| script                  | what it does                                                      |
| ----------------------- | ----------------------------------------------------------------- |
| `pnpm dist:cli:dev`     | `tsup` bundle → `dist/dev/cli.cjs`                                |
| `pnpm dist:bin`         | `bun --compile` × 5 → `dist/bin/fern-<plat>[.exe]`                 |
| `pnpm dist:npm`         | template + binaries → `dist/npm/{wrapper,fern-<plat>}/` + archives |
| `pnpm dist:release`     | runs all three end-to-end                                          |

`dist:npm` requires `--version`, e.g.
`node build.npm.mjs --version=0.1.0`. See `build.npm.mjs` and `npm/README.md`.

### Versioning strategy

CLI v2 starts at **6.0.0**, continuing the semver timeline from where CLI v1
(`fern-api`) left off at 5.x. This keeps the version history coherent for
users migrating from `fern-api` to `@fern-api/fern`.

- Pre-releases before the stable launch use `6.0.0-rc.1`, `6.0.0-rc.2`, etc.
- The first stable tag must be `cli-v2/v6.0.0`.
- On the first stable release, CI automatically runs `npm deprecate fern-api`
  to redirect users to `@fern-api/fern`. This requires a classic npm token
  with publish access to `fern-api` stored as the **`FERN_API_NPM_TOKEN`**
  repository secret (Settings → Secrets → Actions). Add this secret before
  cutting the first stable release.

### Cutting a release

1. **Pick a version.** Use SemVer starting from 6.0.0. Pre-releases use a
   dash: `6.0.0-rc.1` → npm dist-tag `rc`. Stable releases get dist-tag
   `latest`.
2. **Tag and push.** Tag scheme is `cli-v2/v<version>`:
   ```sh
   git tag cli-v2/v6.0.0
   git push origin cli-v2/v6.0.0
   ```
3. **CI does the rest.** `.github/workflows/release-cli-v2.yml` triggers on
   `cli-v2/v*` tags and:
   - cross-compiles all 5 binaries with Bun
   - assembles `@fern-api/fern` + 5 platform packages
   - creates a GitHub Release with platform tarballs/zips, SHA256 checksums,
     and a build provenance attestation
   - publishes to npm via OIDC trusted publishing (no token), with npm
     package provenance
   - on stable releases only: deprecates `fern-api` on npm, pointing users
     to `@fern-api/fern` (requires `FERN_API_NPM_TOKEN` secret)

### Dry-run / smoke test

Use the workflow's `workflow_dispatch` with `dry_run=true` to build everything
without publishing or creating a release. Artifacts (`cli-v2-archives` and
`cli-v2-npm-packages`) are uploaded so you can download and inspect.

Locally:

```sh
pnpm --filter @fern-api/cli-v2 dist:cli:dev
pnpm --filter @fern-api/cli-v2 dist:bin
cd packages/cli/cli-v2
node build.npm.mjs --version=6.0.0-dev
cd dist/npm/wrapper && npm pack --dry-run
```

### Supported platforms

Bun cross-compiles for `darwin-arm64`, `darwin-x64`, `linux-arm64`,
`linux-x64`, and `win32-x64`. There is no `linux-x64-musl` cross target
yet; Alpine users should install `gcompat` to run the glibc binary:

```sh
apk add gcompat
```

### Naming, signing, and what's next

- **Phase 1 (this workflow):** unsigned binaries, npm with provenance,
  GitHub Release with checksums + attestation, tag-driven.
- **Phase 2:** macOS notarization + Windows Authenticode signing.
- **Phase 3:** Homebrew tap, Scoop bucket, winget manifest (all consume the
  GitHub Release artifacts).
- **Phase 4:** binary-aware in-CLI auto-update.
