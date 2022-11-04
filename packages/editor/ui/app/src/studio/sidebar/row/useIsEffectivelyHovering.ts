import { Popover2Props } from "@blueprintjs/popover2";
import { useIsHovering } from "@fern-ui/react-commons";
import { useIsResizing } from "@fern-ui/split-view";
import { useMemo, useState } from "react";

export type PopoverState = "opening" | "open" | "closing" | "closed";

export declare namespace useIsEffectivelyHovering {
    export interface Return {
        isHovering: boolean;
        popoverState: PopoverState;
        popoverProps: Popover2Props;
        onMouseOver: () => void;
        onMouseLeave: () => void;
        onMouseMove: () => void;
    }
}

export function useIsEffectivelyHovering(): useIsEffectivelyHovering.Return {
    const [popoverState, setPopoverState] = useState<PopoverState>("closed");
    const popoverProps = useMemo(
        (): Popover2Props => ({
            onOpening: () => setPopoverState("opening"),
            onOpened: () => setPopoverState("open"),
            onClosing: () => setPopoverState("closing"),
            onClosed: () => setPopoverState("closed"),
        }),
        []
    );

    const isResizing = useIsResizing();
    const { isHovering, onMouseOver, onMouseLeave, onMouseMove } = useIsHovering();
    const isEffectivelyHovering = popoverState === "opening" || popoverState === "open" || (isHovering && !isResizing);

    return {
        isHovering: isEffectivelyHovering,
        popoverState,
        popoverProps,
        onMouseOver,
        onMouseLeave,
        onMouseMove,
    };
}
