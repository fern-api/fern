import { Rule } from "./Rule.js";
import { NoComponentSchemaCollisionsRule } from "./rules/no-component-schema-collisions/index.js";
import { NoConflictingParameterNamesRule } from "./rules/no-conflicting-parameter-names/index.js";
import { NoDuplicateAuthHeaderParametersRule } from "./rules/no-duplicate-auth-header-parameters/index.js";
import { NoDuplicateOverridesRule } from "./rules/no-duplicate-overrides/index.js";
import { NoInvalidTagNamesOrFrontmatterRule } from "./rules/no-invalid-tag-names-or-frontmatter/index.js";
import { NoSchemaTitleCollisionsRule } from "./rules/no-schema-title-collisions/index.js";

export function getAllRules(): Rule[] {
    return [
        NoDuplicateAuthHeaderParametersRule,
        NoDuplicateOverridesRule,
        NoSchemaTitleCollisionsRule,
        NoComponentSchemaCollisionsRule,
        NoInvalidTagNamesOrFrontmatterRule,
        NoConflictingParameterNamesRule
    ];
}
