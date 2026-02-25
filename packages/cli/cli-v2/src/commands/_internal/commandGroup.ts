import type { Argv } from "yargs";
import type { GlobalArgs } from "../../context/GlobalArgs.js";

type CommandAdder = (cli: Argv<GlobalArgs>) => void;

/**
 * WeakMap that stores the parent command path for a given yargs instance.
 * This allows leaf commands registered via {@link command} to display
 * the full command path (e.g. `fern sdk add`) in their usage text.
 */
const parentPaths = new WeakMap<object, string>();

/**
 * Returns the parent command path stored for the given yargs instance,
 * or `undefined` if the instance is a top-level command.
 */
export function getParentPath(cli: Argv<GlobalArgs>): string | undefined {
    return parentPaths.get(cli);
}

/**
 * Registers a command group with subcommands.
 *
 * @example
 * ```ts
 * commandGroup(cli, "auth", "Authenticate fern", [
 *     addLoginCommand,
 *     addLogoutCommand,
 * ]);
 * ```
 */
export function commandGroup(
    cli: Argv<GlobalArgs>,
    name: string,
    description: string,
    subcommands: CommandAdder[]
): void {
    cli.command(name, description, (yargs) => {
        parentPaths.set(yargs, name);
        for (const add of subcommands) {
            add(yargs);
        }
        return yargs
            .usage(`$0 ${name}\n\n${description}`)
            .demandCommand(1)
            .fail((msg, err, y) => {
                if (err != null) {
                    process.stderr.write(`${err.message}\n`);
                    process.exit(1);
                }
                if (msg != null) {
                    process.stderr.write(`Error: ${msg}\n\n`);
                }
                y.showHelp();
                process.exit(1);
            });
    });
}
