import { useDocsContext } from "./useDocsContext";

export function useIsSlugSelected(slug: string): boolean {
    const { selectedPath } = useDocsContext();
    return selectedPath?.slug === slug;
}
