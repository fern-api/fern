import { useEffect } from "react";
import { useInView } from "react-intersection-observer";
import { SidebarItemId } from "../context/ApiContext";
import { useApiContext } from "../context/useApiContext";

export function useTrackSidebarItemId({
    serviceIndex,
    endpointIndex,
}: SidebarItemId): (node?: Element | null | undefined) => void {
    const [ref, inView] = useInView();

    const { setIsSidebarItemVisible } = useApiContext();
    useEffect(() => {
        setIsSidebarItemVisible({ serviceIndex, endpointIndex }, inView);
    }, [endpointIndex, inView, serviceIndex, setIsSidebarItemVisible]);

    return ref;
}
