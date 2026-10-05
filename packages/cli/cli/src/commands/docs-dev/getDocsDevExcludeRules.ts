// The v3 dev path validates without loading API workspaces, so these rules would flag every `api:` section.
const RULES_REQUIRING_API_WORKSPACES = ["api-section-has-definition"];

export function getDocsDevExcludeRules({
    brokenLinks,
    apiWorkspacesLoaded
}: {
    brokenLinks: boolean;
    apiWorkspacesLoaded: boolean;
}): string[] {
    return [
        ...(brokenLinks ? [] : ["valid-markdown-links"]),
        ...(apiWorkspacesLoaded ? [] : RULES_REQUIRING_API_WORKSPACES)
    ];
}
