import type { Argv, BuilderCallback } from "yargs";
import type { Context } from "../../context/Context.js";
import type { GlobalArgs } from "../../context/GlobalArgs.js";
import { withContext } from "../../context/withContext.js";

type CommandHandler<T extends GlobalArgs = GlobalArgs> = (context: Context, args: T) => Promise<void>;
type CommandAdder = (cli: Argv<GlobalArgs>) => void;

/**
 * Registers a command that has both a default handler and subcommands.
 *
 * When invoked without a subcommand, the default handler runs.
 * When invoked with a recognized subcommand (e.g. `preview list`), that subcommand runs instead.
 *
 * This is the "git stash" pattern: `git stash` pushes by default,
 * while `git stash list` and `git stash drop` are distinct subcommands.
 *
 * @example
 * ```ts
 * commandWithSubcommands(
 *     cli,
 *     "preview",
 *     "Generate a preview of your documentation site",
 *     handlePreview,
 *     (yargs) => yargs.option("instance", { type: "string" }),
 *     [addListCommand, addDeleteCommand]
 * );
 * ```
 */
export function commandWithSubcommands<T extends GlobalArgs = GlobalArgs>(
    cli: Argv<GlobalArgs>,
    name: string,
    description: string,
    handler: CommandHandler<T>,
    builder: BuilderCallback<GlobalArgs, T> | undefined,
    subcommands: CommandAdder[]
): void {
    cli.command(name, description, (yargs) => {
        for (const add of subcommands) {
            add(yargs);
        }

        // Register the default command ($0) so that `fern docs preview [options]`
        // runs the handler when no subcommand is matched.
        //
        // Use `false` as the description to hide it from the commands list in --help output.
        yargs.command(
            "$0",
            false,
            (inner) => {
                const configured = inner.version(false);
                return builder != null ? builder(configured) : configured;
            },
            withContext(handler) as unknown as () => void
        );

        return yargs.version(false).usage(description);
    });
}
