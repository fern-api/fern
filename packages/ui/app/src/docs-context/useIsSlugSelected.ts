import { useDocsContext } from "./useDocsContext";

export function useIsSlugSelected(slug: string): boolean {
    const { selectedSlug } = useDocsContext();
    return selectedSlug === slug;
}
