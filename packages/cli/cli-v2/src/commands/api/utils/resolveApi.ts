import type { ApiDefinition } from "../../../api/config/ApiDefinition.js";
import { CliError } from "../../../errors/CliError.js";
import type { Workspace } from "../../../workspace/Workspace.js";

/**
 * Resolve a single API from the workspace. If `apiName` is provided, look it up directly.
 * If omitted and only one API exists, return it. Otherwise throw.
 */
export function resolveApi(
    args: { api?: string },
    workspace: Workspace
): { apiName: string; definition: ApiDefinition } {
    const apiNames = Object.keys(workspace.apis);

    if (args.api != null) {
        const definition = workspace.apis[args.api];
        if (definition == null) {
            const available = apiNames.join(", ");
            throw new CliError({
                message: `API '${args.api}' not found. Available APIs: ${available}`
            });
        }
        return { apiName: args.api, definition };
    }

    if (apiNames.length === 1) {
        const apiName = apiNames[0];
        if (apiName == null) {
            throw new CliError({
                message: "Internal error; no APIs found in workspace"
            });
        }
        const definition = workspace.apis[apiName];
        if (definition == null) {
            throw new CliError({
                message: `Internal error; API '${apiName}' not found in workspace`
            });
        }
        return { apiName, definition };
    }

    const available = apiNames.join(", ");
    throw new CliError({
        message: `Multiple APIs found: ${available}. Use --api to select one.`
    });
}
