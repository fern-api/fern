import { ResolvedUrlPath } from "./url-path-resolver/UrlPathResolver";
import { useDocsContext } from "./useDocsContext";

export function useIsPathInView(path: ResolvedUrlPath): boolean {
    const { isPathInView } = useDocsContext();
    return isPathInView(path);
}
