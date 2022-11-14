import { useBooleanState, useIsHovering, useNumericState } from "@fern-ui/react-commons";
import { useIsResizing } from "@fern-ui/split-view";
import React, { PropsWithChildren, useCallback, useEffect, useMemo } from "react";
import { useSelectedSidebarItemId } from "../../../routes/useSelectedSidebarItemId";
import { useSidebarItemState } from "../../context/useSidebarContext";
import { SidebarItemId } from "../../ids/SidebarItemId";
import { StringifiedSidebarItemId } from "../../ids/StringifiedSidebarItemId";
import { isEventSelectionPreventing } from "../utils/markEventAsSelectionPreventing";
import { SidebarItemRowContext, SidebarItemRowContextValue } from "./SidebarItemRowContext";

export declare namespace SidebarItemRowContextProvider {
    export type Props = PropsWithChildren<{
        itemId: SidebarItemId;
    }>;
}

export const SidebarItemRowContextProvider: React.FC<SidebarItemRowContextProvider.Props> = ({ itemId, children }) => {
    /*********************
     * num popovers open *
     *********************/

    const { value: numPopoversOpen, increment: onPopoverOpening, decrement: onPopoverClosing } = useNumericState(0);

    /************
     * hovering *
     ***********/

    const { isHovering: isMouseHovering, onMouseOver, onMouseLeave, onMouseMove } = useIsHovering();
    const isResizing = useIsResizing();
    const isEffectivelyHovering = useMemo(() => {
        if (numPopoversOpen > 0) {
            return true;
        }
        return isMouseHovering && !isResizing;
    }, [isMouseHovering, isResizing, numPopoversOpen]);

    /**************
     * mouse down *
     **************/

    const { value: isMouseDown, setTrue: onMouseDown, setFalse: onMouseUp } = useBooleanState(false);
    const handleMouseDown = useCallback(
        (event: React.MouseEvent) => {
            if (!isEventSelectionPreventing(event) && event.button === 0) {
                onMouseDown();
            }
        },
        [onMouseDown]
    );
    useEffect(() => {
        window.addEventListener("mouseup", onMouseUp);
        return () => {
            window.removeEventListener("mouseup", onMouseUp);
        };
    }, [onMouseUp]);

    /************
     * selected *
     ************/

    const [selectedSidebarItemId, setSelectedSidebarItemId] = useSelectedSidebarItemId();
    const [, setSidebarItemState] = useSidebarItemState(itemId);
    const onClick = useCallback(
        (event: React.MouseEvent) => {
            if (!isEventSelectionPreventing(event)) {
                setSelectedSidebarItemId(itemId);
                setSidebarItemState({ isCollapsed: false });
            }
        },
        [itemId, setSelectedSidebarItemId, setSidebarItemState]
    );
    const isSelected =
        selectedSidebarItemId != null &&
        StringifiedSidebarItemId.stringify(selectedSidebarItemId) === StringifiedSidebarItemId.stringify(itemId);

    // when the SidebarItemId of the selected item changes, reset the URL in
    // case it changed (e.g. if the item was renamed)
    useEffect(() => {
        if (isSelected) {
            setSelectedSidebarItemId(itemId, { replace: true });
        }
    }, [isSelected, itemId, setSelectedSidebarItemId]);

    /*********
     * value *
     *********/

    const value = useCallback(
        (): SidebarItemRowContextValue => ({
            isHovering: isEffectivelyHovering,
            isMouseDown: isMouseDown && !isResizing,
            isSelected,
            popoverProps: {
                onOpening: onPopoverOpening,
                onClosing: onPopoverClosing,
            },
            onMouseOver,
            onMouseLeave,
            onMouseMove,
            onMouseDown: handleMouseDown,
            onClick,
        }),
        [
            handleMouseDown,
            isEffectivelyHovering,
            isMouseDown,
            isResizing,
            isSelected,
            onClick,
            onMouseLeave,
            onMouseMove,
            onMouseOver,
            onPopoverClosing,
            onPopoverOpening,
        ]
    );

    return <SidebarItemRowContext.Provider value={value}>{children}</SidebarItemRowContext.Provider>;
};
