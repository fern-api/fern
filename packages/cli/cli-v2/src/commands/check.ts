import type { Argv } from "yargs";
import { loadFernYml } from "../config/loadFernYml";
import type { Context } from "../context/Context";
import type { GlobalArgs } from "../context/GlobalArgs";
import { withContext } from "../context/withContext";
import { ValidationError } from "../errors/ValidationError";

export interface CheckArgs extends GlobalArgs {}

export function addCheckCommand(cli: Argv<GlobalArgs>): void {
    cli.command(
        "check",
        "Validate your API, docs, and SDK configuration",
        (yargs) => yargs,
        withContext<CheckArgs>(handleCheck)
    );
}

async function handleCheck(context: Context, _args: CheckArgs): Promise<void> {
    try {
        await loadFernYml({ cwd: context.cwd });
    } catch (error) {
        if (error instanceof ValidationError) {
            for (const issue of error.issues) {
                context.stderr.info(issue.toString());
            }
        }
        process.exit(1);
    }
}
