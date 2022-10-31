import { assertNever, Values } from "@fern-api/core-utils";
import { useIsHovering } from "@fern-ui/react-commons";
import classNames from "classnames";
import React, { useCallback, useContext, useRef, useState } from "react";
import { DraggableCore, DraggableEvent, DraggableEventHandler } from "react-draggable";
import styles from "./ResizeHandle.module.scss";
import { SplitViewContext } from "./SplitViewProvider";

export interface ResizeEvent {
    deltaX: number;
    deltaY: number;
}

interface XYCoordinate {
    x: number;
    y: number;
}

export const ResizeHandlePosition = {
    TOP: "top",
    LEFT: "left",
    RIGHT: "right",
    BOTTOM: "bottom",
} as const;
export type ResizeHandlePosition = Values<typeof ResizeHandlePosition>;

export declare namespace ResizeHandle {
    export interface Props {
        onResize: (event: ResizeEvent) => void;
        onStartResizing?: () => void;
        onStopResizing?: () => void;
        position: ResizeHandlePosition;
        centerOnBorder?: boolean;
    }
}

export const ResizeHandle: React.FC<ResizeHandle.Props> = ({
    onResize,
    onStartResizing,
    onStopResizing,
    position,
    centerOnBorder = false,
}) => {
    const ref = useRef<HTMLDivElement | null>(null);

    const lastEvent = useRef<ResizeEvent>({ deltaX: 0, deltaY: 0 });
    const [dragStart, setDragStart] = useState<XYCoordinate>();

    const contextValue = useContext(SplitViewContext);

    const onStart: DraggableEventHandler = useCallback(
        (event) => {
            contextValue?.onStartResizing();
            lastEvent.current = { deltaX: 0, deltaY: 0 };
            setDragStart({
                x: getClientX(event),
                y: getClientY(event),
            });
            onStartResizing?.();
        },
        [contextValue, onStartResizing]
    );

    const onStop: DraggableEventHandler = useCallback(() => {
        contextValue?.onStopResizing();
        setDragStart(undefined);
        onStopResizing?.();
    }, [contextValue, onStopResizing]);

    const onDrag: DraggableEventHandler = useCallback(
        (event) => {
            if (dragStart != null) {
                const nextEvent: ResizeEvent = {
                    deltaX: getClientX(event) - dragStart.x,
                    deltaY: getClientY(event) - dragStart.y,
                };
                onResize({
                    deltaX: nextEvent.deltaX - lastEvent.current.deltaX,
                    deltaY: nextEvent.deltaY - lastEvent.current.deltaY,
                });
                lastEvent.current = nextEvent;
            }
        },
        [dragStart, onResize]
    );

    const { isHovering, onMouseEnter, onMouseLeave } = useIsHovering();

    const isResizingElsewhere = contextValue != null && contextValue.isResizing && dragStart == null;

    return (
        <DraggableCore nodeRef={ref} onStart={onStart} onStop={onStop} onDrag={onDrag}>
            <div
                ref={ref}
                className={classNames(styles.resizeHandle, getClassForPosition(position), {
                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                    [styles.centerOnBorder!]: centerOnBorder,
                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                    [styles.isHovering!]: isHovering && !isResizingElsewhere,
                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                    [styles.isDragging!]: dragStart != null,
                })}
                onMouseEnter={onMouseEnter}
                onMouseLeave={onMouseLeave}
            >
                <div className={styles.resizeHandleInner} />
            </div>
        </DraggableCore>
    );
};

function getClientX(event: DraggableEvent): number {
    if (isMouseEvent(event)) {
        return event.clientX;
    }
    const clientXFromTouch = event.touches[0]?.clientX;
    if (clientXFromTouch != null) {
        return clientXFromTouch;
    }
    throw new Error("Could not get clientX from event");
}

function getClientY(event: DraggableEvent): number {
    if (isMouseEvent(event)) {
        return event.clientY;
    }
    const clientYFromTouch = event.touches[0]?.clientY;
    if (clientYFromTouch != null) {
        return clientYFromTouch;
    }
    throw new Error("Could not get clientY from event");
}

function isMouseEvent(event: DraggableEvent): event is React.MouseEvent<HTMLElement | SVGElement> | MouseEvent {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    return (event as React.MouseEvent).clientX != null;
}

function getClassForPosition(position: ResizeHandlePosition): string {
    switch (position) {
        case ResizeHandlePosition.TOP:
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            return styles.top!;
        case ResizeHandlePosition.BOTTOM:
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            return styles.bottom!;
        case ResizeHandlePosition.LEFT:
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            return styles.left!;
        case ResizeHandlePosition.RIGHT:
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            return styles.right!;
        default:
            assertNever(position);
    }
}
