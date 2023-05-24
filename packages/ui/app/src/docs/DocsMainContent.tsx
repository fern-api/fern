import { NonIdealState } from "@blueprintjs/core";
import { assertNever } from "@fern-api/core-utils";
import { useMemo } from "react";
import { useLocation } from "react-router-dom";
import { ApiDefinitionContextProvider } from "../api-context/ApiDefinitionContextProvider";
import { ApiPage } from "../api-page/ApiPage";
import { useDocsContext } from "../docs-context/useDocsContext";
import { MarkdownPage } from "../markdown-page/MarkdownPage";
import { RedirectToFirstNavigationItem } from "./RedirectToFirstNavigationItem";

export const DocsMainContent: React.FC = () => {
    const location = useLocation();
    const { urlPathResolver, docsDefinition } = useDocsContext();

    const resolvedPath = useMemo(
        () => urlPathResolver.resolvePath(removeLeadingAndTrailingSlashes(location.pathname)),
        [location.pathname, urlPathResolver]
    );

    if (resolvedPath == null) {
        if (location.pathname === "/") {
            return <RedirectToFirstNavigationItem items={docsDefinition.config.navigation.items} slug="" />;
        }
        return <NonIdealState title="404" />;
    }

    switch (resolvedPath.type) {
        case "page":
            return <MarkdownPage path={resolvedPath} />;
        case "api":
            return (
                <ApiDefinitionContextProvider apiSection={resolvedPath.api} apiSlug={resolvedPath.slug}>
                    <ApiPage />
                </ApiDefinitionContextProvider>
            );
        case "apiSubpackage":
        case "endpoint":
        case "topLevelEndpoint":
            return (
                <ApiDefinitionContextProvider apiSection={resolvedPath.api} apiSlug={resolvedPath.apiSlug}>
                    <ApiPage />
                </ApiDefinitionContextProvider>
            );
        case "section":
            return <RedirectToFirstNavigationItem items={resolvedPath.section.items} slug={resolvedPath.slug} />;
        default:
            assertNever(resolvedPath);
    }
};

function removeLeadingAndTrailingSlashes(s: string): string {
    if (s.startsWith("/")) {
        s = s.substring(1);
    }
    if (s.endsWith("/")) {
        s = s.substring(0, s.length - 1);
    }
    return s;
}
