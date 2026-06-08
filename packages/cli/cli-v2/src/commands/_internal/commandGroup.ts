import type { Argv } from "yargs";
import type { GlobalArgs } from "../../context/GlobalArgs.js";
import { makeYargsFailHandler } from "./yargsFailHandler.js";

type CommandAdder = (cli: Argv<GlobalArgs>) => void;

/**
 * Registers a command group with subcommands.
 *
 * Omit `description` to hide the group from the top-level help output
 * (useful for beta/experimental groups).
 *
 * @example
 * ```ts
 * commandGroup({
 *     cli,
 *     name: "auth",
 *     description: "Authenticate fern",
 *     subcommands: [addLoginCommand, addLogoutCommand],
 * });
 * ```
 */
export function commandGroup({
    cli,
    name,
    description,
    subcommands
}: {
    cli: Argv<GlobalArgs>;
    name: string;
    description?: string;
    subcommands: CommandAdder[];
}): void {
    const usageText = description ?? name;
    const builder = (yargs: Argv<GlobalArgs>): Argv<GlobalArgs> => {
        for (const add of subcommands) {
            add(yargs);
        }
        return yargs
            .usage(usageText)
            .demandCommand(1)
            .recommendCommands()
            .fail(makeYargsFailHandler({ showHelp: true }));
    };

    if (description == null) {
        cli.command(name, false, builder);
    } else {
        cli.command(name, description, builder);
    }
}
