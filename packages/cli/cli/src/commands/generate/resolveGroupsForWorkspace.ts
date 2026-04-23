import { TaskContext } from "@fern-api/task-context";
import { AbstractAPIWorkspace } from "@fern-api/workspace-loader";

import { resolveGroupsOrFail } from "./resolveGroupsOrFail.js";

/**
 * Pre-flight resolution of the `--group` list for a single API workspace.
 *
 * Returns the resolved group names on success, or `undefined` when the workspace has no
 * `generators.yml` or defines no groups — callers should forward these "skipped" workspaces
 * to {@link generateWorkspace} so its existing warn-and-return paths fire, matching today's
 * behavior.
 *
 * On misconfiguration (e.g. `--group foo` targeting a workspace that doesn't define `foo`,
 * or no `--group` passed and the workspace has no `default-group`), {@link resolveGroupsOrFail}
 * calls `context.failAndThrow`, which throws a `TaskAbortSignal`. Collecting these via
 * `Promise.all` in the caller aborts the whole command before any generation starts.
 */
export function resolveGroupsForWorkspace({
    workspace,
    groupNames,
    isAutomation,
    context
}: {
    workspace: AbstractAPIWorkspace<unknown>;
    /** One or more `--group` values, or `undefined` if `--group` was not passed. */
    groupNames: string[] | undefined;
    isAutomation: boolean;
    context: TaskContext;
}): string[] | undefined {
    if (workspace.generatorsConfiguration == null) {
        return undefined;
    }
    if (workspace.generatorsConfiguration.groups.length === 0) {
        return undefined;
    }
    return resolveGroupsOrFail({
        groupNames,
        generatorsConfiguration: workspace.generatorsConfiguration,
        isAutomation,
        context
    });
}
