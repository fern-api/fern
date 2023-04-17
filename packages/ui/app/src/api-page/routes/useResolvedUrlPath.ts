import { useMemo } from "react";
import { matchPath, useLocation } from "react-router-dom";
import { DefinitionRoutes } from ".";
import { ResolvedUrlPath } from "../api-context/url-path-resolver/UrlPathResolver";
import { useApiDefinitionContext } from "../api-context/useApiDefinitionContext";

export function useResolvedUrlPath(): ResolvedUrlPath | undefined {
    const { urlPathResolver } = useApiDefinitionContext();
    const location = useLocation();

    const match = matchPath(DefinitionRoutes.API_PACKAGE.absolutePath, location.pathname);
    const urlPath = match?.params["*"];
    return useMemo(
        () => (urlPath != null ? urlPathResolver.resolvePath(urlPath) : undefined),
        [urlPath, urlPathResolver]
    );
}
