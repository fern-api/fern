import type { Rule } from "./Rule";
import { ContentTypeOnlyForMultipartRule } from "./rules/content-type-only-for-multipart";
import { ExplodedFormDataIsArrayRule } from "./rules/exploded-form-data-is-array";
import { ImportFileExistsRule } from "./rules/import-file-exists";
import { MatchingEnvironmentUrlsRule } from "./rules/matching-environment-urls";
import { NoCircularImportsRule } from "./rules/no-circular-imports";
import { NoCircularReferencesRule } from "./rules/no-circular-references";
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
import { NoHeadResponseBodyRule } from "./rules/no-head-response-body";
import { NoMissingAuthRule } from "./rules/no-missing-auth";
import { NoMissingErrorDiscriminantRule } from "./rules/no-missing-error-discriminant";
import { NoMissingRequestNameRule } from "./rules/no-missing-request-name";
import { NoObjectSinglePropertyKeyRule } from "./rules/no-object-single-property-key";
import { NoResponsePropertyRule } from "./rules/no-response-property";
import { NoUndefinedErrorReferenceRule } from "./rules/no-undefined-error-reference";
import { NoUndefinedExampleReferenceRule } from "./rules/no-undefined-example-reference";
import { NoUndefinedPathParametersRule } from "./rules/no-undefined-path-parameters";
import { NoUndefinedTypeReferenceRule } from "./rules/no-undefined-type-reference";
import { NoUndefinedVariableReferenceRule } from "./rules/no-undefined-variable-reference";
import { NoUnusedGenericRule } from "./rules/no-unused-generic";
import { OnlyObjectExtensionsRule } from "./rules/only-object-extensions";
import { RequiredInfoRule } from "./rules/required-info";
import { RequiredPathsRule } from "./rules/required-paths";
import { ValidBasePathRule } from "./rules/valid-base-path";
import { ValidComponentsRule } from "./rules/valid-components";
import { ValidDefaultEnvironmentRule } from "./rules/valid-default-environment";
import { ValidEndpointPathRule } from "./rules/valid-endpoint-path";
import { ValidExampleEndpointCallRule } from "./rules/valid-example-endpoint-call";
import { ValidExampleErrorRule } from "./rules/valid-example-error";
import { ValidExampleTypeRule } from "./rules/valid-example-type";
import { ValidExamplesRule } from "./rules/valid-examples";
import { ValidFieldNamesRule } from "./rules/valid-field-names";
import { ValidGenericRule } from "./rules/valid-generic";
import { ValidNavigationRule } from "./rules/valid-navigation";
import { ValidOauthRule } from "./rules/valid-oauth";
import { ValidOpenApiVersionRule } from "./rules/valid-openapi-version";
import { ValidOperationsRule } from "./rules/valid-operations";
import { ValidPaginationRule } from "./rules/valid-pagination";
import { ValidParametersRule } from "./rules/valid-parameters";
import { ValidPathItemsRule } from "./rules/valid-path-items";
import { ValidPathParametersConfigurationRule } from "./rules/valid-path-parameters-configuration";
import { ValidReferencesRule } from "./rules/valid-references";
import { ValidRequestBodyRule } from "./rules/valid-request-body";
import { ValidResponsesRule } from "./rules/valid-responses";
import { ValidSchemasRule } from "./rules/valid-schemas";
import { ValidSecurityRule } from "./rules/valid-security";
import { ValidServerUrlsRule } from "./rules/valid-server-urls";
import { ValidServiceUrlsRule } from "./rules/valid-service-urls";
import { ValidStreamConditionRule } from "./rules/valid-stream-condition";
import { ValidTypeNameRule } from "./rules/valid-type-name";
import { ValidTypeReferenceWithDefaultAndValidationRule } from "./rules/valid-type-reference-with-default-and-validation";
import { ValidVersionRule } from "./rules/valid-version";

export function getAllRules(): Rule[] {
    return [
        ContentTypeOnlyForMultipartRule,
        ExplodedFormDataIsArrayRule,
        ImportFileExistsRule,
        MatchingEnvironmentUrlsRule,
        NoCircularImportsRule,
        NoCircularReferencesRule,
        NoComplexQueryParamsRule,
        NoConflictingEndpointParametersRule,
        NoConflictingEndpointPathsRule,
        NoConflictingRequestWrapperPropertiesRule,
        NoDuplicateDeclarationsRule,
        NoDuplicateEnumValuesRule,
        NoDuplicateExampleNamesRule,
        NoDuplicateFieldNamesRule,
        NoErrorStatusCodeConflictRule,
        NoExtensionsWithFileUploadRule,
        NoGetRequestBodyRule,
        NoHeadResponseBodyRule,
        NoMissingAuthRule,
        NoMissingErrorDiscriminantRule,
        NoMissingRequestNameRule,
        NoObjectSinglePropertyKeyRule,
        NoResponsePropertyRule,
        NoUndefinedErrorReferenceRule,
        NoUndefinedExampleReferenceRule,
        NoUndefinedPathParametersRule,
        NoUndefinedTypeReferenceRule,
        NoUndefinedVariableReferenceRule,
        NoUnusedGenericRule,
        OnlyObjectExtensionsRule,
        RequiredInfoRule,
        RequiredPathsRule,
        ValidBasePathRule,
        ValidComponentsRule,
        ValidDefaultEnvironmentRule,
        ValidEndpointPathRule,
        ValidExampleEndpointCallRule,
        ValidExampleErrorRule,
        ValidExampleTypeRule,
        ValidExamplesRule,
        ValidFieldNamesRule,
        ValidGenericRule,
        ValidNavigationRule,
        ValidOauthRule,
        ValidOpenApiVersionRule,
        ValidOperationsRule,
        ValidPaginationRule,
        ValidParametersRule,
        ValidPathItemsRule,
        ValidPathParametersConfigurationRule,
        ValidReferencesRule,
        ValidRequestBodyRule,
        ValidResponsesRule,
        ValidSchemasRule,
        ValidSecurityRule,
        ValidServerUrlsRule,
        ValidServiceUrlsRule,
        ValidStreamConditionRule,
        ValidTypeNameRule,
        ValidTypeReferenceWithDefaultAndValidationRule,
        ValidVersionRule
    ];
}

export function getAllEnabledRules(): Rule[] {
    return getAllRules().filter(({ DISABLE_RULE = false }) => !DISABLE_RULE);
}
