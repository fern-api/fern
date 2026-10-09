import { basename, dirname, join } from "node:path";
import YAML, { isMap, isSeq } from "yaml";

import type { Rename } from "./planGeneratorsSlot.js";
import type { RubiconDiagnostic } from "./types.js";

/** Where sdk-config.yml goes when cli was its only target; the Fern CLI discovers only sdk-config.yml. */
export const RENAMED_SDK_CONFIG = "sdk-config.rubicon.yml";
const LANGUAGE = "cli";

export interface RetargetPlan {
    kind: "none" | "remove" | "rename";
    write: { path: string; contents: string } | undefined;
    rename: Rename | undefined;
    rollback: string[];
    diagnostics: RubiconDiagnostic[];
}

/**
 * Takes the cli target out of sdk-config.yml once generators.yml owns it (RUBICON-PLAN.md, D4): a
 * plain `fern generate` fails when sdk-config.yml and a generators.yml group both select `cli`.
 * Mirrors `fern sdk migrate` in reverse: remove the entry and keep it as a commented rollback block,
 * or rename the file when cli was the only target (SDK Config needs at least one).
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
    const none: RetargetPlan = { kind: "none", write: undefined, rename: undefined, rollback: [], diagnostics: [] };
    const document = YAML.parseDocument(contents);
    const targets = isMap(document.contents) ? document.contents.get("targets") : undefined;
    if (!isSeq(targets)) {
        return none;
    }
    const plainTargets: unknown = targets.toJSON();
    const index = Array.isArray(plainTargets)
        ? plainTargets.findIndex((target: unknown) => isRecord(target) && target.language === LANGUAGE)
        : -1;
    const removed = targets.items[index];
    if (removed == null) {
        return none;
    }

    if (targets.items.length === 1) {
        const renamed = join(dirname(configPath), RENAMED_SDK_CONFIG);
        if (exists(renamed)) {
            return {
                ...none,
                diagnostics: [
                    {
                        severity: "error",
                        path: RENAMED_SDK_CONFIG,
                        code: "RUBICON_RENAME_CONFLICT",
                        message: `Cannot rename ${configPath}: ${renamed} already exists.`,
                        action: `Remove or rename ${renamed}, then run rubicon again.`
                    }
                ]
            };
        }
        return {
            ...none,
            kind: "rename",
            rename: { from: configPath, to: renamed },
            rollback: [`Rename ${renamed} back to ${configPath}.`]
        };
    }

    const removedText = YAML.stringify([removed.toJSON()]).trimEnd();
    targets.items.splice(index, 1);
    const generatorsFile = basename(generatorsPath);
    const note = [
        ` The ${LANGUAGE} target moved to ${generatorsFile} (fern sdk rubicon).`,
        ` Rollback: delete the ${LANGUAGE} group from ${generatorsFile}, then restore this target under targets:`,
        ...removedText.split("\n").map((line) => `   ${line}`)
    ].join("\n");
    document.comment = document.comment != null ? `${document.comment}\n${note}` : note;
    return {
        ...none,
        kind: "remove",
        write: { path: configPath, contents: document.toString({ lineWidth: 0 }) },
        rollback: [
            `Delete the ${LANGUAGE} group from ${generatorsPath}.`,
            `Restore the ${LANGUAGE} target in ${configPath} from the commented block at the end of the file.`
        ]
    };
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return value !== null && typeof value === "object" && !Array.isArray(value);
}
