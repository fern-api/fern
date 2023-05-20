import { NonIdealState } from "@blueprintjs/core";
import { assertNever } from "@fern-api/core-utils";
import { useMemo } from "react";
import { useLocation } from "react-router-dom";
import { ApiDefinitionContextProvider } from "../api-context/ApiDefinitionContextProvider";
import { ApiSubpackage } from "../api-page/definition/subpackages/ApiSubpackage";
import { useDocsContext } from "../docs-context/useDocsContext";

export const DocsMainContent: React.FC = () => {
    const location = useLocation();
    const { urlPathResolver } = useDocsContext();

    const resolvedPath = useMemo(
        () =>
            urlPathResolver.resolvePath({
                // remove leading / from location.pathname
                pathname: location.pathname.substring(1),
                hash: location.hash,
            }),
        [location.hash, location.pathname, urlPathResolver]
    );

    if (resolvedPath == null) {
        return <NonIdealState title="404" />;
    }

    switch (resolvedPath.type) {
        case "page":
            return <div>page</div>;
        case "top-level-endpoint":
            return <NonIdealState title="Top-level endpoint" />;
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
