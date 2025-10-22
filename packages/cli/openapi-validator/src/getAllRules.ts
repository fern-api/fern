import type { Rule } from "./Rule";
import { NoCircularReferencesRule } from "./rules/no-circular-references";
import { RequiredInfoRule } from "./rules/required-info";
import { RequiredPathsRule } from "./rules/required-paths";
import { ValidComponentsRule } from "./rules/valid-components";
import { ValidExamplesRule } from "./rules/valid-examples";
import { ValidOpenApiVersionRule } from "./rules/valid-openapi-version";
import { ValidOperationsRule } from "./rules/valid-operations";
import { ValidParametersRule } from "./rules/valid-parameters";
import { ValidPathItemsRule } from "./rules/valid-path-items";
import { ValidReferencesRule } from "./rules/valid-references";
import { ValidRequestBodyRule } from "./rules/valid-request-body";
import { ValidResponsesRule } from "./rules/valid-responses";
import { ValidSchemasRule } from "./rules/valid-schemas";
import { ValidSecurityRule } from "./rules/valid-security";
import { ValidServerUrlsRule } from "./rules/valid-server-urls";

export function getAllRules(): Rule[] {
    return [
        RequiredInfoRule,
        RequiredPathsRule,
        ValidOpenApiVersionRule,
        ValidServerUrlsRule,
        ValidPathItemsRule,
        ValidOperationsRule,
        ValidParametersRule,
        ValidRequestBodyRule,
        ValidResponsesRule,
        ValidSchemasRule,
        ValidSecurityRule,
        ValidComponentsRule,
        NoCircularReferencesRule,
        ValidReferencesRule,
        ValidExamplesRule
    ];
}

export function getAllEnabledRules(): Rule[] {
    return getAllRules().filter(({ DISABLE_RULE = false }) => !DISABLE_RULE);
}
