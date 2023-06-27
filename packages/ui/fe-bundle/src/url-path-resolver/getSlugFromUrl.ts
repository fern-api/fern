import * as FernRegistryDocsRead from "@fern-fern/registry-browser/api/resources/docs/resources/v1/resources/read";

export function getSlugFromUrl({
    pathname,
    docsBasePath,
    docsDefinition,
}: {
    pathname: string;
    docsBasePath: string | undefined;
    docsDefinition: FernRegistryDocsRead.DocsDefinition;
}): string | undefined {
    const slug = docsBasePath != null ? pathname.replace(new RegExp(`^${docsBasePath}`), "") : pathname;
    let slugWithoutLeadingOrTrailingSlashes = removeLeadingAndTrailingSlashes(slug);

    if (slugWithoutLeadingOrTrailingSlashes === "") {
        const firstNavigationItem = docsDefinition.config.navigation.items[0];
        if (firstNavigationItem != null) {
            slugWithoutLeadingOrTrailingSlashes = firstNavigationItem.urlSlug;
        } else {
            return undefined;
        }
    }

    return slugWithoutLeadingOrTrailingSlashes;
}
function removeLeadingAndTrailingSlashes(s: string): string {
    if (s.startsWith("/")) {
        s = s.substring(1);
    }
    if (s.endsWith("/")) {
        s = s.substring(0, s.length - 1);
    }
    return s;
}
