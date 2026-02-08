import { Rule } from "./Rule.js";
import { ContentTypeOnlyForMultipartRule } from "./rules/content-type-only-for-multipart/index.js";
import { ExplodedFormDataIsArrayRule } from "./rules/exploded-form-data-is-array/index.js";
import { ImportFileExistsRule } from "./rules/import-file-exists/index.js";
import { MatchingEnvironmentUrlsRule } from "./rules/matching-environment-urls/index.js";
import { NoCircularImportsRule } from "./rules/no-circular-imports/index.js";
import { NoComplexQueryParamsRule } from "./rules/no-complex-query-params/index.js";
import { NoConflictingEndpointParametersRule } from "./rules/no-conflicting-endpoint-parameters/index.js";
import { NoConflictingEndpointPathsRule } from "./rules/no-conflicting-endpoint-paths/index.js";
import { NoConflictingRequestWrapperPropertiesRule } from "./rules/no-conflicting-request-wrapper-properties/index.js";
import { NoDuplicateDeclarationsRule } from "./rules/no-duplicate-declarations/index.js";
import { NoDuplicateEnumValuesRule } from "./rules/no-duplicate-enum-values/index.js";
import { NoDuplicateExampleNamesRule } from "./rules/no-duplicate-example-names/index.js";
import { NoDuplicateFieldNamesRule } from "./rules/no-duplicate-field-names/index.js";
import { NoErrorStatusCodeConflictRule } from "./rules/no-error-status-code-conflict/index.js";
import { NoExtensionsWithFileUploadRule } from "./rules/no-extensions-with-file-upload/index.js";
import { NoGetRequestBodyRule } from "./rules/no-get-request-body/index.js";
import { NoMissingAuthRule } from "./rules/no-missing-auth/index.js";
import { NoMissingErrorDiscriminantRule } from "./rules/no-missing-error-discriminant/index.js";
import { NoMissingRequestNameRule } from "./rules/no-missing-request-name/index.js";
import { NoObjectSinglePropertyKeyRule } from "./rules/no-object-single-property-key/index.js";
import { NoResponsePropertyRule } from "./rules/no-response-property/index.js";
import { NoUndefinedErrorReferenceRule } from "./rules/no-undefined-error-reference/index.js";
import { NoUndefinedExampleReferenceRule } from "./rules/no-undefined-example-reference/index.js";
import { NoUndefinedPathParametersRule } from "./rules/no-undefined-path-parameters/index.js";
import { NoUndefinedTypeReferenceRule } from "./rules/no-undefined-type-reference/index.js";
import { NoUndefinedVariableReferenceRule } from "./rules/no-undefined-variable-reference/index.js";
import { NoUnusedGenericRule } from "./rules/no-unused-generic/index.js";
import { OnlyObjectExtensionsRule } from "./rules/only-object-extensions/index.js";
import { ValidBasePathRule } from "./rules/valid-base-path/index.js";
import { ValidDefaultEnvironmentRule } from "./rules/valid-default-environment/index.js";
import { ValidEndpointPathRule } from "./rules/valid-endpoint-path/index.js";
import { ValidExampleEndpointCallRule } from "./rules/valid-example-endpoint-call/index.js";
import { ValidExampleErrorRule } from "./rules/valid-example-error/index.js";
import { ValidExampleTypeRule } from "./rules/valid-example-type/index.js";
import { ValidFieldNamesRule } from "./rules/valid-field-names/index.js";
import { ValidGenericRule } from "./rules/valid-generic/index.js";
import { ValidNavigationRule } from "./rules/valid-navigation/index.js";
import { ValidOauthRule } from "./rules/valid-oauth/index.js";
import { ValidPaginationRule } from "./rules/valid-pagination/index.js";
import { ValidPathParametersConfigurationRule } from "./rules/valid-path-parameters-configuration/index.js";
import { ValidServiceUrlsRule } from "./rules/valid-service-urls/index.js";
import { ValidStreamConditionRule } from "./rules/valid-stream-condition/index.js";
import { ValidTypeNameRule } from "./rules/valid-type-name/index.js";
import { ValidTypeReferenceWithDefaultAndValidationRule } from "./rules/valid-type-reference-with-default-and-validation/index.js";
import { ValidVersionRule } from "./rules/valid-version/index.js";

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
        NoExtensionsWithFileUploadRule,
        ValidNavigationRule,
        NoUndefinedVariableReferenceRule,
        OnlyObjectExtensionsRule,
        NoResponsePropertyRule,
        ValidOauthRule,
        ValidPaginationRule,
        ValidExampleErrorRule,
        ValidTypeReferenceWithDefaultAndValidationRule,
        ValidStreamConditionRule,
        ValidVersionRule,
        NoUnusedGenericRule,
        ValidGenericRule,
        ContentTypeOnlyForMultipartRule,
        ValidPathParametersConfigurationRule,
        ExplodedFormDataIsArrayRule
    ];
}

export function getAllEnabledRules(): Rule[] {
    return getAllRules().filter(({ DISABLE_RULE = false }) => !DISABLE_RULE);
}
