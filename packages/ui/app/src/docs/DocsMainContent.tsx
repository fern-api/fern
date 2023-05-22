import { NonIdealState } from "@blueprintjs/core";
import { assertNever } from "@fern-api/core-utils";
import { useMemo } from "react";
import { useLocation } from "react-router-dom";
import { ApiDefinitionContextProvider } from "../api-context/ApiDefinitionContextProvider";
import { useDocsContext } from "../docs-context/useDocsContext";
import { MarkdownPage } from "../markdown-page/MarkdownPage";
import { RedirectToFirstNavigationItem } from "./RedirectToFirstNavigationItem";

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
            return <RedirectToFirstNavigationItem items={docsDefinition.config.navigation.items} />;
        }
        return <NonIdealState title="404" />;
    }

    switch (resolvedPath.type) {
        case "page":
            return <MarkdownPage page={resolvedPath.page} />;
        case "api":
        case "apiSubpackage":
        case "endpoint":
        case "topLevelEndpoint":
            return (
                <ApiDefinitionContextProvider apiId={resolvedPath.api.api}>
                    <ApiPage api={resolvedPath.api} />
                </ApiDefinitionContextProvider>
            );
        case "section":
            return <RedirectToFirstNavigationItem items={resolvedPath.section.items} />;
        default:
            assertNever(resolvedPath);
    }
};
