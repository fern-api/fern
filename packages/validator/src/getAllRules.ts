import { Rule } from "./Rule";
import ImportFileExistsRule from "./rules/import-file-exists";
import NoDuplicateEnumValuesRule from "./rules/no-duplicate-enum-values";
import NoDuplicateIdsRule from "./rules/no-duplicate-ids";
import NoDuplicateServiceNamesRule from "./rules/no-duplicate-service-names";
import NoUndefinedErrorReferenceRule from "./rules/no-undefined-error-reference";
import NoUndefinedPathParametersRule from "./rules/no-undefined-path-parameters";
import NoUndefinedTypeReferenceRule from "./rules/no-undefined-type-reference";
import ValidAuthInServiceRule from "./rules/valid-auth-in-service";
import ValidEnumNameRule from "./rules/valid-enum-name";

export function getAllRules(): Rule[] {
    return [
        NoUndefinedTypeReferenceRule,
        NoDuplicateEnumValuesRule,
        NoUndefinedPathParametersRule,
        ValidAuthInServiceRule,
        ValidEnumNameRule,
        ImportFileExistsRule,
        NoDuplicateIdsRule,
        NoUndefinedErrorReferenceRule,
        NoDuplicateServiceNamesRule,
    ];
}
