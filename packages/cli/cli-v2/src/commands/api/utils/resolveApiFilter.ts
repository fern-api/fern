import type { Context } from "../../../context/Context.js";
import { CliError } from "../../../errors/CliError.js";
import { promptSelect } from "../../../ui/promptSelect.js";
import type { Workspace } from "../../../workspace/Workspace.js";

const ALL_SENTINEL = "__all__";

/**
 * Resolves the `--api` flag to an API name filter.
 *
 * - If `--api` is provided, validates it exists and returns it.
 * - If there is only one API, returns `undefined` (no filtering needed).
 * - If there are multiple APIs and the terminal is interactive, shows a
 *   dropdown letting the user pick one or "all". Returns `undefined` for "all".
 * - If there are multiple APIs and the terminal is non-interactive, returns
 *   `undefined` so the command runs over all APIs.
 */
export async function resolveApiFilter({
    context,
    args,
    workspace
}: {
    context: Context;
    args: { api?: string };
    workspace: Workspace;
}): Promise<string | undefined> {
    const apiNames = Object.keys(workspace.apis);

    if (args.api != null) {
        if (workspace.apis[args.api] == null) {
            throw new CliError({
                message: `API '${args.api}' not found. Available APIs: ${apiNames.join(", ")}`
            });
        }
        return args.api;
    }

    if (apiNames.length <= 1 || !context.isTTY) {
        return undefined;
    }

    const selected = await promptSelect<string>({
        isTTY: context.isTTY,
        message: "Multiple APIs found. Select one:",
        choices: [
            { name: `all (${apiNames.length} apis)`, value: ALL_SENTINEL },
            ...apiNames.map((name) => ({ name, value: name }))
        ],
        nonInteractiveError: `Multiple APIs found: ${apiNames.join(", ")}. Use --api to select one.`,
        flagHint: (value) => (value !== ALL_SENTINEL ? `--api ${value}` : undefined)
    });

    return selected !== ALL_SENTINEL ? selected : undefined;
}
