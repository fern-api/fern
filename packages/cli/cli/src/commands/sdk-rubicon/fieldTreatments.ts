import type { SdkConfigIrV1 } from "@postman/sdk-config";

import { FIELD_TREATMENT_OVERRIDES } from "./fieldTreatmentOverrides.js";
import { HOSTED_FIELD_TREATMENTS } from "./hostedFieldTreatments.js";
import type { RubiconDiagnostic } from "./types.js";
import { type IrLeaf, nonDefaultLeaves } from "./walkIr.js";

export interface FieldTreatment {
    treatment: "Map" | "Warn" | "Reject" | "Ignore";
    note: string;
}

/** The hosted bridge's table with rubicon's overrides applied. One entry per schema leaf path. */
export const FIELD_TREATMENTS: Record<string, FieldTreatment> = {
    ...HOSTED_FIELD_TREATMENTS,
    ...FIELD_TREATMENT_OVERRIDES
};

/**
 * Classifies every field that differs from its default: Warn adds a warning, Reject an error, Ignore
 * nothing, and Map needs a rule that claims the path. A field the table does not know is an error,
 * so a newer SDK Config field cannot slip through unreviewed.
 */
export function classifyFields(
    ir: SdkConfigIrV1,
    claimedPaths: ReadonlySet<string>,
    leaves: (ir: SdkConfigIrV1) => IrLeaf[] = nonDefaultLeaves
): RubiconDiagnostic[] {
    const diagnostics: RubiconDiagnostic[] = [];
    const reported = new Set<string>();
    for (const { schemaPath, displayPath } of leaves(ir)) {
        if (reported.has(displayPath)) {
            continue;
        }
        reported.add(displayPath);
        const entry = FIELD_TREATMENTS[schemaPath];
        if (entry == null) {
            diagnostics.push({
                severity: "error",
                path: displayPath,
                code: "RUBICON_UNKNOWN_FIELD",
                message: "rubicon does not know this field yet.",
                action: "Upgrade the Fern CLI, or remove the field."
            });
            continue;
        }
        switch (entry.treatment) {
            case "Reject":
                diagnostics.push({
                    severity: "error",
                    path: displayPath,
                    code: "RUBICON_UNSUPPORTED_FIELD",
                    message: entry.note,
                    action: "Remove the field; the Fern CLI generator cannot honor it."
                });
                break;
            case "Warn":
                diagnostics.push({
                    severity: "warning",
                    path: displayPath,
                    code: "RUBICON_IGNORED_FIELD",
                    message: entry.note,
                    action: "No action needed unless you rely on it."
                });
                break;
            case "Map":
                if (!claimedPaths.has(schemaPath)) {
                    diagnostics.push({
                        severity: "error",
                        path: displayPath,
                        code: "RUBICON_UNOWNED_FIELD",
                        message: "No rubicon rule maps this field.",
                        action: "Report this as a rubicon bug."
                    });
                }
                break;
            case "Ignore":
                break;
        }
    }
    return diagnostics;
}
