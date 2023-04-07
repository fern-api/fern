import { Rule } from "./Rule";
import { ImportFileExistsRule } from "./rules/import-file-exists";
import { MatchingEnvironmentUrlsRule } from "./rules/matching-environment-urls";
import { NoCircularImportsRule } from "./rules/no-circular-imports";
import { NoComplexQueryParamsRule } from "./rules/no-complex-query-params";
import { NoConflictingEndpointParametersRule } from "./rules/no-conflicting-endpoint-parameters";
import { NoConflictingEndpointPathsRule } from "./rules/no-conflicting-endpoint-paths";
import { NoConflictingRequestWrapperPropertiesRule } from "./rules/no-conflicting-request-wrapper-properties";
import { NoDuplicateDeclarationsRule } from "./rules/no-duplicate-declarations";
import { NoDuplicateEnumValuesRule } from "./rules/no-duplicate-enum-values";
import { NoDuplicateExampleNamesRule } from "./rules/no-duplicate-example-names";
import { NoDuplicateFieldNamesRule } from "./rules/no-duplicate-field-names";
import { NoErrorStatusCodeConflictRule } from "./rules/no-error-status-code-conflict";
import { NoExtensionsWithFileUploadRule } from "./rules/no-extensions-with-file-upload";
import { NoGetRequestBodyRule } from "./rules/no-get-request-body";
import { NoMissingAuthRule } from "./rules/no-missing-auth";
import { NoMissingErrorDiscriminantRule } from "./rules/no-missing-error-discriminant";
import { NoMissingRequestNameRule } from "./rules/no-missing-request-name";
import { NoObjectSinglePropertyKeyRule } from "./rules/no-object-single-property-key";
import { NoUndefinedErrorReferenceRule } from "./rules/no-undefined-error-reference";
import { NoUndefinedExampleReferenceRule } from "./rules/no-undefined-example-reference";
import { NoUndefinedPathParametersRule } from "./rules/no-undefined-path-parameters";
import { NoUndefinedTypeReferenceRule } from "./rules/no-undefined-type-reference";
import { NoUndefinedVariableReferenceRule } from "./rules/no-undefined-variable-reference";
import { OnlyObjectExtensionsRule } from "./rules/only-object-extensions";
import { ValidBasePathRule } from "./rules/valid-base-path";
import { ValidDefaultEnvironmentRule } from "./rules/valid-default-environment";
import { ValidEndpointPathRule } from "./rules/valid-endpoint-path";
import { ValidExampleEndpointCallRule } from "./rules/valid-example-endpoint-call";
import { ValidExampleTypeRule } from "./rules/valid-example-type";
import { ValidFieldNamesRule } from "./rules/valid-field-names";
import { ValidNavigationRule } from "./rules/valid-navigation";
import { ValidServiceUrlsRule } from "./rules/valid-service-urls";
import { ValidStreamConditionRule } from "./rules/valid-stream-condition";
import { ValidTypeNameRule } from "./rules/valid-type-name";

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
        NoObjectSinglePropertyKeyRule,
        NoGetRequestBodyRule,
        NoComplexQueryParamsRule,
        ValidDefaultEnvironmentRule,
        NoMissingErrorDiscriminantRule,
        ValidExampleTypeRule,
        NoErrorStatusCodeConflictRule,
        NoMissingAuthRule,
        NoMissingRequestNameRule,
        NoConflictingEndpointParametersRule,
        NoConflictingRequestWrapperPropertiesRule,
        ValidExampleEndpointCallRule,
        NoDuplicateExampleNamesRule,
        NoUndefinedExampleReferenceRule,
        MatchingEnvironmentUrlsRule,
        ValidServiceUrlsRule,
        ValidBasePathRule,
        ValidEndpointPathRule,
        NoConflictingEndpointPathsRule,
        ValidTypeNameRule,
        ValidStreamConditionRule,
        NoExtensionsWithFileUploadRule,
        ValidNavigationRule,
        NoUndefinedVariableReferenceRule,
        OnlyObjectExtensionsRule,
    ];
}

export function getAllEnabledRules(): Rule[] {
    return getAllRules().filter(({ DISABLE_RULE = false }) => !DISABLE_RULE);
}
