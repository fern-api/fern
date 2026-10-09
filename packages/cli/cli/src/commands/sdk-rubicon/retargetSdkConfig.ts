import { basename, dirname, join } from "node:path";
import YAML, { isMap, isSeq } from "yaml";

import type { Rename } from "./planGeneratorsSlot.js";
import type { RubiconDiagnostic } from "./types.js";

/**
 * The cli-only SDK Config rubicon keeps for reruns. The Fern CLI discovers only sdk-config.yml, so
 * this file never runs as an SDK Config target.
 */
export const RENAMED_SDK_CONFIG = "sdk-config.rubicon.yml";
const LANGUAGE = "cli";

export interface RetargetPlan {
    kind: "none" | "remove" | "rename";
    /** The edited sdk-config.yml (remove case). */
    write: { path: string; contents: string } | undefined;
    /** sdk-config.rubicon.yml with the cli target only (remove case). */
    extract: { path: string; contents: string } | undefined;
    rename: Rename | undefined;
    rollback: string[];
    diagnostics: RubiconDiagnostic[];
}

/**
 * Takes the cli target out of sdk-config.yml once generators.yml owns it (RUBICON-PLAN.md, D4): a
 * plain `fern generate` fails when sdk-config.yml and a generators.yml group both select `cli`.
 *
 * - cli was the only target: rename sdk-config.yml to sdk-config.rubicon.yml (SDK Config needs at
 *   least one target), as `fern sdk migrate` renames generators.yml to generators.legacy.yml.
 * - other targets remain: remove the cli entry (keeping comments and a commented rollback block),
 *   and write sdk-config.rubicon.yml with the cli target only.
 *
 * Either way sdk-config.rubicon.yml holds the cli target, so a rerun reads it and edits nothing.
 */
export function planRetarget({
    configPath,
    contents,
    generatorsPath,
    exists
}: {
    configPath: string;
    contents: string;
    generatorsPath: string;
    exists: (path: string) => boolean;
}): RetargetPlan {
    const none: RetargetPlan = {
        kind: "none",
        write: undefined,
        extract: undefined,
        rename: undefined,
        rollback: [],
        diagnostics: []
    };
    if (basename(configPath) === RENAMED_SDK_CONFIG) {
        return none;
    }
    const document = YAML.parseDocument(contents);
    const targets = targetsOf(document);
    const plainTargets: unknown = targets?.toJSON();
    const plainList: unknown[] = Array.isArray(plainTargets) ? plainTargets : [];
    const index = plainList.findIndex((target) => isRecord(target) && target.language === LANGUAGE);
    const removed = plainList[index];
    if (targets == null || removed == null) {
        return none;
    }
    const renamed = join(dirname(configPath), RENAMED_SDK_CONFIG);
    if (exists(renamed)) {
        return {
            ...none,
            diagnostics: [
                {
                    severity: "error",
                    path: RENAMED_SDK_CONFIG,
                    code: "RUBICON_RENAME_CONFLICT",
                    message: `Cannot write ${renamed}: it already exists.`,
                    action: `Run rubicon on it (\`--config ${renamed}\`), or remove it, then run rubicon again.`
                }
            ]
        };
    }

    if (targets.items.length === 1) {
        return {
            ...none,
            kind: "rename",
            rename: { from: configPath, to: renamed },
            rollback: [`Rename ${renamed} back to ${configPath}.`]
        };
    }

    const extract = YAML.parseDocument(contents);
    const extractTargets = targetsOf(extract);
    if (extractTargets != null) {
        extractTargets.items = extractTargets.items.filter((_, itemIndex) => itemIndex === index);
    }

    const removedText = YAML.stringify([removed]).trimEnd();
    targets.items.splice(index, 1);
    const note = [
        ` The ${LANGUAGE} target moved to ${RENAMED_SDK_CONFIG} and ${basename(generatorsPath)} (fern sdk rubicon).`,
        ` Rollback: delete the ${LANGUAGE} group from ${basename(generatorsPath)}, then restore this target under targets:`,
        ...removedText.split("\n").map((line) => `   ${line}`)
    ].join("\n");
    document.comment = document.comment != null ? `${document.comment}\n${note}` : note;
    return {
        ...none,
        kind: "remove",
        write: { path: configPath, contents: document.toString({ lineWidth: 0 }) },
        extract: { path: renamed, contents: extract.toString({ lineWidth: 0 }) },
        rollback: [
            `Delete the ${LANGUAGE} group from ${generatorsPath}.`,
            `Restore the ${LANGUAGE} target in ${configPath} from the commented block at the end of the file, then delete ${renamed}.`
        ]
    };
}

/** Whether an SDK Config document lists a cli target (checked before loading, which would fail without one). */
export function hasCliTarget(contents: string): boolean {
    const parsed: unknown = YAML.parse(contents);
    const targets = isRecord(parsed) ? parsed.targets : undefined;
    return (
        Array.isArray(targets) && targets.some((target: unknown) => isRecord(target) && target.language === LANGUAGE)
    );
}

function targetsOf(document: YAML.Document.Parsed): YAML.YAMLSeq | undefined {
    const targets = isMap(document.contents) ? document.contents.get("targets") : undefined;
    return isSeq(targets) ? targets : undefined;
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return value !== null && typeof value === "object" && !Array.isArray(value);
}
