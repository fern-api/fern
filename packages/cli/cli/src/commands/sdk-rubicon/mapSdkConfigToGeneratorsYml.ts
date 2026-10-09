import type { SdkConfigIrV1 } from "@postman/sdk-config";

import { classifyFields } from "./fieldTreatments.js";
import { authRule } from "./rules/auth.js";
import { environmentsRule } from "./rules/environments.js";
import { generatorRule } from "./rules/generator.js";
import { headersRule } from "./rules/headers.js";
import { oauthRule } from "./rules/oauth.js";
import { specsRule } from "./rules/specs.js";
import type { MapperInput, MapperOutput, MapperRule, RuleContext } from "./types.js";

/** Applied in order. The OAuth rule runs before the auth rule, which reads its auth-schemes entries. */
export const RULES: readonly MapperRule[] = [
    specsRule,
    oauthRule,
    authRule,
    headersRule,
    environmentsRule,
    generatorRule
];

/**
 * Maps one expanded SDK Config cli target to a generators.yml object for fernapi/fern-cli-generator.
 * Pure: no file system access, and problems are returned as diagnostics instead of thrown.
 */
export function mapSdkConfigToGeneratorsYml(
    ir: SdkConfigIrV1,
    input: MapperInput,
    rules: readonly MapperRule[] = RULES
): MapperOutput {
    const output: MapperOutput = { generatorsYml: {}, overlayMerges: [], diagnostics: [], hints: [] };
    const context: RuleContext = {
        ir,
        input,
        output,
        error: (path, code, message, action) =>
            output.diagnostics.push({ severity: "error", path, code, message, ...(action != null ? { action } : {}) }),
        warn: (path, code, message, action) =>
            output.diagnostics.push({ severity: "warning", path, code, message, ...(action != null ? { action } : {}) })
    };
    output.diagnostics.push(...classifyFields(ir, new Set(rules.flatMap((rule) => rule.paths))));
    if (output.diagnostics.some((diagnostic) => diagnostic.severity === "error")) {
        return output;
    }
    for (const rule of rules) {
        rule.apply(context);
    }
    return { ...output, generatorsYml: orderSections(output.generatorsYml) };
}

/** Writes `default-group`, `auth-schemes`, `api`, then `groups`, the order Fern's own files use. */
function orderSections(generatorsYml: Record<string, unknown>): Record<string, unknown> {
    const { "default-group": defaultGroup, "auth-schemes": authSchemes, api, groups, ...rest } = generatorsYml;
    return {
        ...(defaultGroup != null ? { "default-group": defaultGroup } : {}),
        ...(authSchemes != null ? { "auth-schemes": authSchemes } : {}),
        ...(api != null ? { api } : {}),
        ...(groups != null ? { groups } : {}),
        ...rest
    };
}
