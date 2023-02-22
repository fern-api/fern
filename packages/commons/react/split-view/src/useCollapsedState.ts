import { useCallback, useEffect, useMemo, useRef } from "react";
import { Size, useConvertSizeToPixels } from "./Size";

export declare namespace useCollapsedState {
    export interface Args {
        initialSize: Size;
        sizeInPixels: number | undefined;
        setSizeInPixels: (size: number) => void;
        sizeToCollapse: Size | undefined;
        onStopResizing: () => void;
    }

    export type Return = [boolean, (isCollapsed: boolean) => void];
}

export function useCollapsedState({
    initialSize,
    sizeInPixels,
    setSizeInPixels,
    sizeToCollapse,
    onStopResizing,
}: useCollapsedState.Args): useCollapsedState.Return {
    const convertSizeToPixels = useConvertSizeToPixels();

    const isCollapsed = useMemo(() => {
        if (sizeInPixels == null) {
            return false;
        }
        const sizeToCollapseInPixels = convertSizeToPixels(sizeToCollapse);
        return sizeToCollapseInPixels != null && sizeInPixels <= sizeToCollapseInPixels;
    }, [convertSizeToPixels, sizeInPixels, sizeToCollapse]);

    const sizeInPixelsWhenLastCollapsed = useRef<number>();
    useEffect(() => {
        if (!isCollapsed) {
            sizeInPixelsWhenLastCollapsed.current = undefined;
        }
    }, [isCollapsed]);

    const setIsCollapsed = useCallback(
        (newIsCollapsed: boolean) => {
            const sizeToCollapseInPixels = convertSizeToPixels(sizeToCollapse);
            if (sizeToCollapseInPixels == null) {
                return;
            }
            if (newIsCollapsed) {
                sizeInPixelsWhenLastCollapsed.current = sizeInPixels;
                setSizeInPixels(sizeToCollapseInPixels);
            } else {
                if (sizeInPixelsWhenLastCollapsed.current != null) {
                    setSizeInPixels(sizeInPixelsWhenLastCollapsed.current);
                } else {
                    // revert to initial size
                    const initialSizeInPixels = convertSizeToPixels(initialSize);
                    if (initialSizeInPixels != null) {
                        setSizeInPixels(initialSizeInPixels);
                    }
                }
            }
            setTimeout(onStopResizing);
        },
        [convertSizeToPixels, initialSize, onStopResizing, setSizeInPixels, sizeInPixels, sizeToCollapse]
    );

    return [isCollapsed, setIsCollapsed];
}
