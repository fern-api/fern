import type { Argv, BuilderCallback } from "yargs";
import type { Context } from "../../context/Context.js";
import type { GlobalArgs } from "../../context/GlobalArgs.js";
import { withContext } from "../../context/withContext.js";

type CommandHandler<T extends GlobalArgs = GlobalArgs> = (context: Context, args: T) => Promise<void>;

/**
 * Registers a leaf command with a handler.
 *
 * @example
 * ```ts
 * command(cli, "generate", "Generate SDKs", handleGenerate, (yargs) =>
 *     yargs
 *         .option("group", { type: "string", description: "Generator group" })
 *         .option("local", { type: "boolean", default: false })
 * );
 * ```
 */
export function command<T extends GlobalArgs = GlobalArgs>(
    cli: Argv<GlobalArgs>,
    name: string,
    description: string,
    handler: CommandHandler<T>,
    builder?: BuilderCallback<GlobalArgs, T>
): void {
    cli.command(
        name,
        description,
        (yargs) => {
            const configured = yargs.version(false).usage(description);
            return builder != null ? builder(configured) : configured;
        },
        withContext(handler) as unknown as () => void
    );
}
