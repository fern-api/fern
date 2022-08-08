import { Rule } from "./Rule";
import ImportFileExistsRule from "./rules/import-file-exists";
import {
    default as NoDuplicateDeclarationsRule,
    default as NoDuplicateServiceNamesRule,
} from "./rules/no-duplicate-declarations";
import NoDuplicateEnumValuesRule from "./rules/no-duplicate-enum-values";
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
        NoDuplicateDeclarationsRule,
        NoUndefinedErrorReferenceRule,
        NoDuplicateServiceNamesRule,
    ];
}
