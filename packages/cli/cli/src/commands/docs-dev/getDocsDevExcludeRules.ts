// The v3 dev path validates without loading API workspaces, so these rules would flag every `api:` section.
const RULES_REQUIRING_API_WORKSPACES = ["api-section-has-definition"];

// These rules resolve the whole docs site a second time (API references included), which defeats `--skip-api`.
const RULES_THAT_REBUILD_API_REFERENCES = ["missing-redirects", "valid-markdown-links"];

// These rules read and parse every OpenAPI spec; their findings are about endpoint pages `--skip-api` doesn't render.
const RULES_THAT_READ_API_SPECS = [
    "valid-openapi-examples",
    "no-openapi-v2-in-docs",
    "no-non-component-refs",
    "valid-local-references"
];

export function getDocsDevExcludeRules({
    brokenLinks,
    apiWorkspacesLoaded,
    skipApi = false
}: {
    brokenLinks: boolean;
    apiWorkspacesLoaded: boolean;
    skipApi?: boolean;
}): string[] {
    const rules = [
        ...(brokenLinks ? [] : ["valid-markdown-links"]),
        ...(apiWorkspacesLoaded ? [] : RULES_REQUIRING_API_WORKSPACES),
        ...(skipApi ? [...RULES_THAT_REBUILD_API_REFERENCES, ...RULES_THAT_READ_API_SPECS] : [])
    ];
    return [...new Set(rules)];
}
