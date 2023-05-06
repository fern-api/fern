import { useMemo } from "react";
import { matchPath, useLocation } from "react-router-dom";
import { DefinitionRoutes } from ".";
import { ResolvedUrlPath } from "../api-context/url-path-resolver/UrlPathResolver";
import { useApiDefinitionContext } from "../api-context/useApiDefinitionContext";

export function useResolvedUrlPath(): ResolvedUrlPath | undefined {
    const { urlPathResolver } = useApiDefinitionContext();
    const location = useLocation();

    return useMemo(() => {
        const match = matchPath(DefinitionRoutes.API_PACKAGE.absolutePath, location.pathname);
        const urlPath = match?.params["*"];
        if (urlPath == null) {
            return undefined;
        }
        return urlPathResolver.resolvePath({
            pathname: urlPath,
            hash: location.hash,
        });
    }, [location.hash, location.pathname, urlPathResolver]);
}
