import { useMemo } from "react";
import { parsePath, useLocation } from "react-router-dom";

export function useIsPathnameSelected(pathname: string): boolean {
    const location = useLocation();
    return useMemo(() => {
        // remove leading slash from location.pathname
        const currentPathname = location.pathname.substring(1);

        const targetPathname = parsePath(pathname).pathname;

        return currentPathname === targetPathname;
    }, [location.pathname, pathname]);
}
