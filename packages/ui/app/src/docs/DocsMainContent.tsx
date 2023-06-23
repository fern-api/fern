import { NonIdealState } from "@blueprintjs/core";
import { assertNever } from "@fern-api/core-utils";
import { ApiDefinitionContextProvider } from "../api-context/ApiDefinitionContextProvider";
import { ApiPage } from "../api-page/ApiPage";
import { CustomDocsPage } from "../custom-docs-page/CustomDocsPage";
import { useDocsContext } from "../docs-context/useDocsContext";
import { RedirectToFirstNavigationItem } from "./RedirectToFirstNavigationItem";

export const DocsMainContent: React.FC = () => {
    const { resolvedPathFromUrl, docsDefinition, basePath, pathname } = useDocsContext();

    if (resolvedPathFromUrl == null) {
        if (pathname === removeLeadingSlash(basePath)) {
            return <RedirectToFirstNavigationItem items={docsDefinition.config.navigation.items} slug="" />;
        }
        return <NonIdealState title="404" />;
    }

    switch (resolvedPathFromUrl.type) {
        case "page":
            return <CustomDocsPage path={resolvedPathFromUrl} key={resolvedPathFromUrl.slug} />;
        case "api":
            return (
                <ApiDefinitionContextProvider
                    apiSection={resolvedPathFromUrl.apiSection}
                    apiSlug={resolvedPathFromUrl.slug}
                >
                    <ApiPage />
                </ApiDefinitionContextProvider>
            );
        case "clientLibraries":
        case "apiSubpackage":
        case "endpoint":
        case "topLevelEndpoint":
            return (
                <ApiDefinitionContextProvider
                    apiSection={resolvedPathFromUrl.apiSection}
                    apiSlug={resolvedPathFromUrl.apiSlug}
                >
                    <ApiPage key={resolvedPathFromUrl.slug} />
                </ApiDefinitionContextProvider>
            );
        case "section":
            return (
                <RedirectToFirstNavigationItem
                    items={resolvedPathFromUrl.section.items}
                    slug={resolvedPathFromUrl.slug}
                />
            );
        default:
            assertNever(resolvedPathFromUrl);
    }
};

function removeLeadingSlash(path: string): string {
    if (path.startsWith("/")) {
        return path.substring(1);
    } else {
        return path;
    }
}
