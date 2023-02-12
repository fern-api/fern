import { useEffect } from "react";
import { useInView } from "react-intersection-observer";
import { SidebarItemId } from "../context/ApiContext";
import { useApiContext } from "../context/useApiContext";

export function useTrackSidebarItemId(sidebarItemId: SidebarItemId): (node?: Element | null | undefined) => void {
    const [ref, inView] = useInView({
        // detect what is intersecting the middle of the screen
        // https://stackoverflow.com/a/69020644/4238485
        rootMargin: "-50% 0% -50% 0%",
        // this must be 0 for the above rootMargin to work
        threshold: 0,
    });

    const { setIsSidebarItemFocused } = useApiContext();
    useEffect(() => {
        setIsSidebarItemFocused(sidebarItemId, inView);
    }, [inView, setIsSidebarItemFocused, sidebarItemId]);

    return ref;
}
