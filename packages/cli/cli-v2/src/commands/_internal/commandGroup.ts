import type { Argv } from "yargs";
import type { GlobalArgs } from "../../context/GlobalArgs.js";

type CommandAdder = (cli: Argv<GlobalArgs>) => void;

/**
 * Registers a command group with subcommands.
 *
 * Pass `false` for `description` to hide the group from the top-level help
 * output (useful for beta/experimental groups).
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
    description: string | false,
    subcommands: CommandAdder[]
): void {
    const usageText = description === false ? name : description;
    const builder = (yargs: Argv<GlobalArgs>): Argv<GlobalArgs> => {
        for (const add of subcommands) {
            add(yargs);
        }
        return yargs
            .usage(usageText)
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
    };

    if (description === false) {
        cli.command(name, false, builder);
    } else {
        cli.command(name, description, builder);
    }
}
