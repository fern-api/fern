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
