import { ApiChecker } from "../../../api/checker/ApiChecker.js";
import type { Context } from "../../../context/Context.js";
import { CliError } from "../../../errors/CliError.js";
import type { Workspace } from "../../../workspace/Workspace.js";

/**
 * Run API validation and throw if there are violations.
 */
export async function checkOrThrow({
    context,
    workspace,
    apiName
}: {
    context: Context;
    workspace: Workspace;
    apiName: string;
}): Promise<void> {
    const checker = new ApiChecker({ context, cliVersion: workspace.cliVersion });
    const result = await checker.check({ workspace, apiNames: [apiName] });
    if (result.invalidApis.size > 0) {
        for (const violation of result.violations) {
            context.stderr.error(
                `${violation.displayRelativeFilepath}:${violation.line}:${violation.column}: ${violation.message}`
            );
        }
        throw CliError.exit();
    }
}
