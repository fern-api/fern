import { ResolvedUrlPath } from "./url-path-resolver/UrlPathResolver";
import { useDocsContext } from "./useDocsContext";

export function useIsPathSelected(path: ResolvedUrlPath): boolean {
    const { selectedPath } = useDocsContext();
    return selectedPath?.slug === path.slug;
}
