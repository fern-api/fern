import { matchPath, useLocation } from "react-router-dom";
import { DefinitionRoutes } from ".";

export function useCurrentPathname(): string {
    const location = useLocation();

    const match = matchPath(DefinitionRoutes.API_PACKAGE.absolutePath, location.pathname);

    const pathname = match?.params["*"];

    if (pathname == null) {
        throw new Error("Failed to match API_PACKAGE path");
    }

    return pathname;
}
