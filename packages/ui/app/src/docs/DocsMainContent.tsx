import { NonIdealState } from "@blueprintjs/core";
import { assertNever } from "@fern-api/core-utils";
import { useMemo } from "react";
import { useLocation } from "react-router-dom";
import { ApiDefinitionContextProvider } from "../api-context/ApiDefinitionContextProvider";
import { Endpoint } from "../api-page/definition/endpoints/Endpoint";
import { ApiSubpackage } from "../api-page/definition/subpackages/ApiSubpackage";
import { useDocsContext } from "../docs-context/useDocsContext";
import { MarkdownPage } from "../markdown-page/MarkdownPage";

export const DocsMainContent: React.FC = () => {
    const location = useLocation();
    const { urlPathResolver } = useDocsContext();

    const resolvedPath = useMemo(
        () =>
            urlPathResolver.resolvePath(
                // remove leading / from location.pathname
                location.pathname.substring(1)
            ),
        [location.pathname, urlPathResolver]
    );

    if (resolvedPath == null) {
        return <NonIdealState title="404" />;
    }

    switch (resolvedPath.type) {
        case "page":
            return <MarkdownPage pageId={resolvedPath.pageId} />;
        case "top-level-endpoint":
            return (
                <ApiDefinitionContextProvider apiId={resolvedPath.apiId}>
                    <Endpoint endpoint={resolvedPath.endpoint} />
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
