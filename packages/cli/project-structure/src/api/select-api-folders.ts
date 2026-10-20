import { normalizeCommandLineApiWorkspace } from "./normalize-command-line-api-workspace.js";

export type ApiFolderSelection =
    | { type: "selected"; names: string[] }
    /** `--api` named folders that are not in `apis/`. */
    | { type: "unknown"; names: string[] }
    /** `apis/` has no folders and no `--api` was given. */
    | { type: "none-found" }
    /** `apis/` has several folders, no `--api` was given, and the caller does not default to all of them. */
    | { type: "ambiguous"; available: string[] };

/** Decides which `apis/<name>` folders to load from the folders that exist and what `--api` asked for. */
export function selectApiFolders({
    available,
    requested,
    defaultToAll
}: {
    available: readonly string[];
    requested: string | string[] | undefined;
    defaultToAll: boolean;
}): ApiFolderSelection {
    const requestedNames = normalizeCommandLineApiWorkspace(requested);
    if (requestedNames != null) {
        const unknown = requestedNames.filter((name) => !available.includes(name));
        if (unknown.length > 0) {
            return { type: "unknown", names: unknown };
        }
        return { type: "selected", names: available.filter((name) => requestedNames.includes(name)) };
    }
    if (available.length === 0) {
        return { type: "none-found" };
    }
    if (available.length > 1 && !defaultToAll) {
        return { type: "ambiguous", available: [...available] };
    }
    return { type: "selected", names: [...available] };
}
