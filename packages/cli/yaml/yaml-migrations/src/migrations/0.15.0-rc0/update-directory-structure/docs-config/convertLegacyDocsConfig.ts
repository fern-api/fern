import { docsYml } from "@fern-api/configuration";
import { LegacyDocs } from ".";

export function convertLegacyDocsConfig({
    docsConfiguration,
    docsURLs,
    apiName
}: {
    docsConfiguration: LegacyDocs.DocsConfiguration;
    docsURLs: docsYml.RawSchemas.DocsInstances[];
    apiName: string | undefined;
}): docsYml.RawSchemas.DocsConfiguration {
    return {
        ...docsConfiguration,
        navbarLinks: docsConfiguration.navbarLinks?.map((link) => ({ ...link, href: link.url })),
        instances: docsURLs,
        logo: typeof docsConfiguration.logo === "string" ? { dark: docsConfiguration.logo } : docsConfiguration.logo,
        navigation:
            apiName != null
                ? addApiNameToNavigationConfig({ navigation: docsConfiguration.navigation, apiName })
                : docsConfiguration.navigation
    };
}

function addApiNameToNavigationConfig({
    navigation,
    apiName
}: {
    navigation: LegacyDocs.NavigationItem[];
    apiName: string | undefined;
}): docsYml.RawSchemas.NavigationItem[] {
    return navigation.map((item) => {
        if (isAPIReferenceSection(item)) {
            return {
                ...item,
                apiName
            };
        }
        return item;
    });
}

function isAPIReferenceSection(item: LegacyDocs.NavigationItem): item is LegacyDocs.ApiSectionConfiguration {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    return (item as LegacyDocs.ApiSectionConfiguration).api != null;
}
