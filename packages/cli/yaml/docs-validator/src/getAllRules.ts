import { Rule } from "./Rule";
import { AccentColorContrastRule } from "./rules/accent-color-contrast";
import { AllRolesMustBeDeclaredRule } from "./rules/all-roles-must-be-declared";
import { FilepathsExistRule } from "./rules/filepaths-exist";
import { NoNonComponentRefsRule } from "./rules/no-non-component-refs";
import { NoOpenApiV2InDocsRule } from "./rules/no-openapi-v2-in-docs";
import { OnlyVersionedNavigation } from "./rules/only-versioned-navigation";
import { ValidDocsEndpoints } from "./rules/valid-docs-endpoints";
import { ValidFileTypes } from "./rules/valid-file-types";
import { ValidFrontmatter } from "./rules/valid-frontmatter";
import { ValidMarkdownLinks } from "./rules/valid-markdown-link";
import { ValidateProductFileRule } from "./rules/validate-product-file";
import { ValidateVersionFileRule } from "./rules/validate-version-file";

const allRules = [
    FilepathsExistRule,
    NoOpenApiV2InDocsRule, // Check OpenAPI v2 first (more fundamental issue)
    NoNonComponentRefsRule, // Check non-component references (will skip v2 files)
    OnlyVersionedNavigation,
    ValidateVersionFileRule,
    ValidateProductFileRule,
    AccentColorContrastRule,
    ValidMarkdownLinks,
    ValidFileTypes,
    ValidDocsEndpoints,
    AllRolesMustBeDeclaredRule,
    ValidFrontmatter
    // ValidMarkdownFileReferences
];

export function getAllRules(exclusions?: string[]): Rule[] {
    if (!exclusions) {
        return allRules;
    }
    const set = new Set(exclusions);
    return allRules.filter((r) => !set.has(r.name));
}
