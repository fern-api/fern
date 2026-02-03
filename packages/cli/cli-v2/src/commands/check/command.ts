import type { Argv } from "yargs";
import { ApiChecker } from "../../api/checker/ApiChecker";
import type { Context } from "../../context/Context";
import type { GlobalArgs } from "../../context/GlobalArgs";
import { CliError } from "../../errors/CliError";
import { Workspace } from "../../workspace/Workspace";
import { command } from "../_internal/command";

interface CheckArgs extends GlobalArgs {
    /** Validate a specific API */
    api?: string;
    /** Treat warnings as errors */
    strict?: boolean;
}

export function addCheckCommand(cli: Argv<GlobalArgs>): void {
    command(cli, "check", "Validate your API, docs, and SDK configuration", handleCheck, (yargs) =>
        yargs
            .option("api", {
                type: "string",
                description: "Validate a specific API"
            })
            .option("strict", {
                type: "boolean",
                description: "Treat warnings as errors",
                default: false
            })
    );
}

async function handleCheck(context: Context, args: CheckArgs): Promise<void> {
    const workspace = await context.loadWorkspaceOrThrow();

    validateArgs({ args, workspace });

    const checker = new ApiChecker({
        context,
        cliVersion: workspace.cliVersion
    });

    const checkResult = await checker.check({
        workspace,
        apiNames: args.api != null ? [args.api] : undefined,
        strict: args.strict
    });

    const hasErrors = checkResult.invalidApis.size > 0;
    const hasWarnings = checkResult.warningCount > 0;

    // Fail if there are errors, or if strict mode and there are warnings.
    if (hasErrors || (args.strict && hasWarnings)) {
        throw CliError.exit();
    }
}

function validateArgs({ args, workspace }: { args: CheckArgs; workspace: Workspace }): void {
    // Validate that the requested API exists if specified.
    if (args.api != null && workspace.apis[args.api] == null) {
        const availableApis = Object.keys(workspace.apis).join(", ");
        throw new CliError({
            message: `API '${args.api}' not found. Available APIs: ${availableApis}`
        });
    }
}
