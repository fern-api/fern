import { readFile } from "node:fs/promises";
import YAML from "yaml";

import { commitMigrationFiles, fileMode } from "../sdk-migrate/commitMigrationFiles.js";
import { type Rename, RUBICON_HEADER } from "./planGeneratorsSlot.js";
import type { OverlayMerge } from "./types.js";

export interface FileChanges {
    files: Array<{ path: string; contents: string; mode?: number }>;
    remove: string[];
}

const HEADER = `${RUBICON_HEADER} from sdk-config.yml.
# Rerunning rubicon regenerates this file. It keeps binaryName, customCommands, profiles, rootGroup and
# the browser-login keys (client-id, success-redirect-url, error-redirect-url); other edits are lost.
`;

/**
 * Plans every file change of one rubicon run: generators.yml, merged overlays, a new
 * fern.config.json, the sdk-config.yml edit, and renames (as a write of the new path plus a removal
 * of the old one). Nothing is written here.
 */
export async function planFileChanges({
    generatorsPath,
    generatorsYml,
    overlayMerges,
    renames,
    removals,
    sdkConfigWrites,
    fernConfig
}: {
    generatorsPath: string;
    generatorsYml: Record<string, unknown>;
    overlayMerges: OverlayMerge[];
    renames: Rename[];
    removals: string[];
    /** The sdk-config.yml edit and sdk-config.rubicon.yml (D4). */
    sdkConfigWrites: Array<{ path: string; contents: string }>;
    fernConfig: { path: string; organization: string } | undefined;
}): Promise<FileChanges> {
    const files: FileChanges["files"] = [
        {
            path: generatorsPath,
            contents: `${HEADER}${YAML.stringify(generatorsYml)}`,
            mode: await fileMode(generatorsPath)
        }
    ];
    for (const merge of overlayMerges) {
        files.push({ path: merge.path, contents: await mergeOverlays(merge.overlayPaths) });
    }
    if (fernConfig != null) {
        files.push({
            path: fernConfig.path,
            contents: `${JSON.stringify({ organization: fernConfig.organization, version: "*" }, null, 2)}\n`
        });
    }
    for (const write of sdkConfigWrites) {
        files.push({ ...write, mode: await fileMode(write.path) });
    }
    for (const rename of renames) {
        files.push({
            path: rename.to,
            contents: await readFile(rename.from, "utf8"),
            mode: await fileMode(rename.from)
        });
    }
    return { files, remove: [...renames.map((rename) => rename.from), ...removals] };
}

/** Applies the planned changes as one transaction: on any failure every file is restored. */
export async function applyFileChanges(changes: FileChanges): Promise<void> {
    await commitMigrationFiles(changes);
}

/** Fern takes one overlay file per spec, so several overlays become one file with all their actions, in order. */
export async function mergeOverlays(overlayPaths: string[]): Promise<string> {
    const documents = await Promise.all(
        overlayPaths.map(async (path) => {
            const parsed: unknown = YAML.parse(await readFile(path, "utf8"));
            return isRecord(parsed) ? parsed : {};
        })
    );
    const actions = documents.flatMap((document) => (Array.isArray(document.actions) ? document.actions : []));
    return YAML.stringify({ ...documents[0], actions });
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return value !== null && typeof value === "object" && !Array.isArray(value);
}
