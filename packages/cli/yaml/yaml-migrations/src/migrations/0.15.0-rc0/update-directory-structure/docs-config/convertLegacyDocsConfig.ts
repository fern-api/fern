import { DocsURL, LegacyDocs, MigratedDocs } from ".";

export function convertLegacyDocsConfig({
    docsConfiguration,
    docsURLs,
}: {
    docsConfiguration: LegacyDocs.DocsConfiguration;
    docsURLs: DocsURL[];
}): MigratedDocs.DocsConfiguration {
    return {
        ...docsConfiguration,
        instances: docsURLs,
        logo: typeof docsConfiguration.logo === "string" ? { dark: docsConfiguration.logo } : docsConfiguration.logo,
    };
}
