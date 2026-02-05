import type { Argv } from "yargs";
import type { GlobalArgs } from "../../context/GlobalArgs";

type CommandAdder = (cli: Argv<GlobalArgs>) => void;

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
