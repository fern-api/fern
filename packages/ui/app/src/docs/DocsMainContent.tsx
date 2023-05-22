import { NonIdealState } from "@blueprintjs/core";
import { assertNever } from "@fern-api/core-utils";
import { useMemo } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { ApiDefinitionContextProvider } from "../api-context/ApiDefinitionContextProvider";
import { ApiSubpackage } from "../api-page/definition/subpackages/ApiSubpackage";
import { TopLevelEndpoint } from "../api-page/definition/top-level-endpoint/TopLevelEndpoint";
import { useDocsContext } from "../docs-context/useDocsContext";
import { MarkdownPage } from "../markdown-page/MarkdownPage";

export const DocsMainContent: React.FC = () => {
    const location = useLocation();
    const { urlPathResolver, docsDefinition } = useDocsContext();

    const resolvedPath = useMemo(
        () =>
            urlPathResolver.resolvePath(
                // remove leading / from location.pathname
                location.pathname.substring(1)
            ),
        [location.pathname, urlPathResolver]
    );

    if (resolvedPath == null) {
        if (location.pathname === "/") {
            const urlSlug = docsDefinition.config.navigation.items[0]?._visit({
                page: (page) => page.urlSlug,
                section: (section) => section.urlSlug,
                api: (api) => api.urlSlug,
                _other: () => undefined,
            });
            if (urlSlug != null) {
                return <Navigate to={urlSlug} replace />;
            }
        }
        return <NonIdealState title="404" />;
    }

    switch (resolvedPath.type) {
        case "page":
            return <MarkdownPage pageId={resolvedPath.pageId} />;
        case "top-level-endpoint":
            return (
                <ApiDefinitionContextProvider apiId={resolvedPath.apiId}>
                    <TopLevelEndpoint endpoint={resolvedPath.endpoint} />
                </ApiDefinitionContextProvider>
            );
        case "api-subpackage":
            return (
                <ApiDefinitionContextProvider apiId={resolvedPath.apiId}>
                    <ApiSubpackage key={resolvedPath.subpackageId} subpackageId={resolvedPath.subpackageId} />
                </ApiDefinitionContextProvider>
            );
        default:
            assertNever(resolvedPath);
    }
};
