/**
 * Removed replay bootstrap/init flags that still parse for one release so
 * customers get migration guidance instead of a silent clean start. The
 * parse stubs (and this module) are deleted next release.
 */

export const IMPORT_HISTORY_REMOVED_MESSAGE: string =
    "--import-history has been removed. Imported historical patches can overlap, and overlapping " +
    "patches duplicate content on every regeneration — eventually breaking compilation. " +
    "To migrate existing customizations: (1) reset customized generator-owned files to their " +
    "as-generated state, (2) run bootstrap with no flags, (3) re-apply your customizations as a " +
    "single commit. Replay tracks them from then on.";

export const MIGRATE_FERNIGNORE_REMOVED_MESSAGE: string =
    "--fernignore-action migrate has been removed. Files matching .fernignore are hands-off: the " +
    "generator never overwrites them and Replay never tracks them, so there is nothing to " +
    "migrate. To move a file under Replay tracking, remove its .fernignore entry and commit " +
    "your customization; Replay detects it on the next regeneration.";

export interface RemovedReplayFlagInputs {
    importHistory?: boolean;
    fernignoreAction?: string;
}

/**
 * Returns the error message to print (before exiting non-zero) when a removed
 * flag was passed, or undefined when all inputs are acceptable. Checks
 * `importHistory === true` so explicit `--no-import-history` stays accepted.
 */
export function getRemovedReplayFlagError({
    importHistory,
    fernignoreAction
}: RemovedReplayFlagInputs): string | undefined {
    if (importHistory === true) {
        return IMPORT_HISTORY_REMOVED_MESSAGE;
    }
    if (fernignoreAction === "migrate") {
        return MIGRATE_FERNIGNORE_REMOVED_MESSAGE;
    }
    return undefined;
}
