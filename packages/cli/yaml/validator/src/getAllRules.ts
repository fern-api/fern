import { Rule } from "./Rule";
import ImportFileExistsRule from "./rules/import-file-exists";
import NoCircularImportsRule from "./rules/no-circular-imports";
import NoComplexQueryParamsRule from "./rules/no-complex-query-params";
import NoDuplicateDeclarationsRule from "./rules/no-duplicate-declarations";
import NoDuplicateEnumValuesRule from "./rules/no-duplicate-enum-values";
import NoDuplicateFieldNamesRule from "./rules/no-duplicate-field-names";
import NoErrorStatusCodeConflict from "./rules/no-error-status-code-conflict";
import NoGetRequestBody from "./rules/no-get-request-body";
import NoMissingErrorDiscriminant from "./rules/no-missing-error-discriminant";
import NoObjectSinglePropertyKey from "./rules/no-object-single-property-key";
import NoUndefinedErrorReferenceRule from "./rules/no-undefined-error-reference";
import NoUndefinedPathParametersRule from "./rules/no-undefined-path-parameters";
import NoUndefinedTypeReferenceRule from "./rules/no-undefined-type-reference";
import ValidDefaultEnvironmentRule from "./rules/valid-default-environment";
import ValidFieldNamesRule from "./rules/valid-field-names";

export function getAllRules(): Rule[] {
    return [
        NoUndefinedTypeReferenceRule,
        NoDuplicateEnumValuesRule,
        NoUndefinedPathParametersRule,
        ImportFileExistsRule,
        NoDuplicateDeclarationsRule,
        NoUndefinedErrorReferenceRule,
        NoCircularImportsRule,
        ValidFieldNamesRule,
        NoDuplicateFieldNamesRule,
        NoObjectSinglePropertyKey,
        NoGetRequestBody,
        NoComplexQueryParamsRule,
        ValidDefaultEnvironmentRule,
        NoMissingErrorDiscriminant,
        NoErrorStatusCodeConflict,
    ];
}

export function getAllEnabledRules(): Rule[] {
    return getAllRules().filter(({ disabled = false }) => !disabled);
}
