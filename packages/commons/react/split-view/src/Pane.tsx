import { assertNever } from "@fern-api/core-utils";
import classNames from "classnames";
import { isFunction } from "lodash-es";
import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { getRelevationDimensionForOrientation } from "./getRelevationDimensionForOrientation";
import styles from "./Pane.module.scss";
import { ResizeEvent, ResizeHandle, ResizeHandlePosition } from "./ResizeHandle";
import { SingleSplitViewContext } from "./SingleSplitViewContext";
import { PercentSize, Size, useConvertSizeToPixels } from "./Size";
import { useCollapsedState } from "./useCollapsedState";

export declare namespace Pane {
    export interface Props {
        className?: string;
        defaultSize: Size;
        minimumSize?: Size;
        maximumSize?: Size;
        resizeHandlePosition: ResizeHandlePosition;
        sizeToCollapse?: Size;
        startCollapsed?: boolean;
        children: JSX.Element | ((args: ChildRendererArgs) => JSX.Element);
    }

    export interface ChildRendererArgs {
        isCollapsed: boolean;
        setIsCollapsed: (isCollapsed: boolean) => void;
        toggleIsCollapsed: () => void;
        sizeInPixels: number | undefined;
        setSizeInPixels: (sizeInPixels: number) => void;
        containerSizeInPixels: number | undefined;
    }
}

export const Pane: React.FC<Pane.Props> = ({
    className,
    defaultSize,
    minimumSize,
    maximumSize,
    sizeToCollapse,
    startCollapsed = false,
    resizeHandlePosition,
    children,
}) => {
    const { orientation, containerSizeInPixels, disabled } = useContext(SingleSplitViewContext)();
    const convertSizeToPixels = useConvertSizeToPixels();

    // while resizing, sometimes the size in pixels isn't equal to the actual size (due to min/max clamping).
    // when we're done resizing, update the size in pixels to match what's actually painted on screen.
    const ref = useRef<HTMLDivElement | null>(null);
    const onStopResizing = useCallback(() => {
        if (ref.current != null) {
            setSizeInPixels(getRelevationDimensionForOrientation(ref.current.getBoundingClientRect(), orientation));
        }
    }, [orientation]);

    const getInitialSizeInPixels = useCallback(() => {
        const sizeInPixels = convertSizeToPixels(
            startCollapsed && sizeToCollapse != null ? sizeToCollapse : defaultSize
        );
        if (sizeInPixels === 0) {
            return undefined;
        }
        return sizeInPixels;
    }, [convertSizeToPixels, defaultSize, sizeToCollapse, startCollapsed]);
    const [sizeInPixels, setSizeInPixels] = useState(getInitialSizeInPixels);

    useEffect(() => {
        if (sizeInPixels == null) {
            setSizeInPixels(getInitialSizeInPixels());
        }
    }, [getInitialSizeInPixels, sizeInPixels]);

    const sizeInPercent = useMemo((): number | undefined => {
        if (sizeInPixels == null || containerSizeInPixels == null) {
            return undefined;
        }
        return sizeInPixels / containerSizeInPixels;
    }, [containerSizeInPixels, sizeInPixels]);

    const [isCollapsed, setIsCollapsed] = useCollapsedState({
        initialSize: defaultSize,
        sizeInPixels,
        setSizeInPixels,
        sizeToCollapse,
        onStopResizing,
    });
    const toggleIsCollapsed = useCallback(() => {
        setIsCollapsed(!isCollapsed);
    }, [isCollapsed, setIsCollapsed]);

    const style = useMemo((): React.CSSProperties | undefined => {
        if (sizeInPercent == null || isCollapsed) {
            return undefined;
        }
        const sizeString: PercentSize = `${sizeInPercent * 100}%`;
        switch (orientation) {
            case "vertical":
                return { height: sizeString, minHeight: minimumSize, maxHeight: maximumSize };
            case "horizontal":
                return { width: sizeString, minWidth: minimumSize, maxWidth: maximumSize };
            default:
                assertNever(orientation);
        }
    }, [sizeInPercent, isCollapsed, orientation, minimumSize, maximumSize]);

    const onMoveResizeHandle = useCallback(
        (event: ResizeEvent) => {
            setSizeInPixels((existing) =>
                existing != null ? existing + getDeltaForPosition(event, resizeHandlePosition) : existing
            );
        },
        [resizeHandlePosition]
    );

    // when the container size changes, use the previous percent to figure out the new size in pixels
    const previousSizeInPercent = useRef<number>();
    useEffect(() => {
        if (previousSizeInPercent.current != null && containerSizeInPixels != null && containerSizeInPixels > 0) {
            setSizeInPixels(previousSizeInPercent.current * containerSizeInPixels);
        }
    }, [containerSizeInPixels]);
    useEffect(() => {
        if (sizeInPercent != null && isFinite(sizeInPercent)) {
            previousSizeInPercent.current = sizeInPercent;
        }
    }, [sizeInPercent]);

    return (
        <div ref={ref} className={classNames(styles.container, className)} style={style}>
            {isFunction(children)
                ? children({
                      isCollapsed,
                      setIsCollapsed,
                      toggleIsCollapsed,
                      sizeInPixels,
                      setSizeInPixels,
                      containerSizeInPixels,
                  })
                : children}
            {disabled || (
                <ResizeHandle
                    onResize={onMoveResizeHandle}
                    position={resizeHandlePosition}
                    centerOnBorder
                    onStopResizing={onStopResizing}
                />
            )}
        </div>
    );
};

function getDeltaForPosition(event: ResizeEvent, position: ResizeHandlePosition): number {
    switch (position) {
        case ResizeHandlePosition.TOP:
            return -event.deltaY;
        case ResizeHandlePosition.BOTTOM:
            return event.deltaY;
        case ResizeHandlePosition.LEFT:
            return -event.deltaX;
        case ResizeHandlePosition.RIGHT:
            return event.deltaX;
        default:
            assertNever(position);
    }
}
