import { Rule } from "./Rule.js";
import { AccentColorContrastRule } from "./rules/accent-color-contrast/index.js";
import { AllRolesMustBeDeclaredRule } from "./rules/all-roles-must-be-declared/index.js";
import { FilepathsExistRule } from "./rules/filepaths-exist/index.js";
import { NoCircularRedirectsRule } from "./rules/no-circular-redirects/index.js";
import { NoNonComponentRefsRule } from "./rules/no-non-component-refs/index.js";
import { NoOpenApiV2InDocsRule } from "./rules/no-openapi-v2-in-docs/index.js";
import { OnlyVersionedNavigation } from "./rules/only-versioned-navigation/index.js";
import { UnusedAssetsRule } from "./rules/unused-assets/index.js";
import { ValidDocsEndpoints } from "./rules/valid-docs-endpoints/index.js";
import { ValidFileTypes } from "./rules/valid-file-types/index.js";
import { ValidFrontmatter } from "./rules/valid-frontmatter/index.js";
import { ValidInstanceUrlRule } from "./rules/valid-instance-url/index.js";
import { ValidLocalReferencesRule } from "./rules/valid-local-references/index.js";
import { ValidMarkdownLinks } from "./rules/valid-markdown-link/index.js";
import { ValidOpenApiExamples } from "./rules/valid-openapi-examples/index.js";
import { ValidateProductFileRule } from "./rules/validate-product-file/index.js";
import { ValidateVersionFileRule } from "./rules/validate-version-file/index.js";

const allRules = [
    FilepathsExistRule,
    NoOpenApiV2InDocsRule, // Check OpenAPI v2 first (more fundamental issue)
    ValidOpenApiExamples, // Validate human examples in OpenAPI specs
    NoNonComponentRefsRule, // Check non-component references (will skip v2 files)
    ValidLocalReferencesRule, // Validate that local references actually exist
    OnlyVersionedNavigation,
    ValidateVersionFileRule,
    ValidateProductFileRule,
    ValidInstanceUrlRule, // Validate instance URLs have valid subdomains
    NoCircularRedirectsRule, // Detect circular redirect chains
    AccentColorContrastRule,
    ValidMarkdownLinks,
    ValidFileTypes,
    ValidDocsEndpoints,
    AllRolesMustBeDeclaredRule,
    ValidFrontmatter
    // ValidMarkdownFileReferences
];

/**
 * Returns the set of rules to run during docs validation.
 * @param exclusions - Rule names to exclude from the default set.
 * @param includeUnusedAssets - Whether to include the opt-in unused-assets rule.
 */
export function getAllRules(exclusions?: string[], includeUnusedAssets?: boolean): Rule[] {
    let rules: Rule[] = [...allRules];
    if (includeUnusedAssets) {
        rules.push(UnusedAssetsRule);
    }
    if (exclusions) {
        const set = new Set(exclusions);
        rules = rules.filter((r) => !set.has(r.name));
    }
    return rules;
}
