import { ResizeSensor } from "@blueprintjs/core";
import { useDimensions } from "@fern-ui/react-commons";
import classNames from "classnames";
import React, { useCallback, useMemo } from "react";
import { getRelevationDimensionForOrientation } from "./getRelevationDimensionForOrientation";
import { SingleSplitViewContext, SingleSplitViewContextValue } from "./SingleSplitViewContext";
import styles from "./SplitView.module.scss";
import { Orientation } from "./types";

const CONTAINER_CLASS_NAME: Record<Orientation, string> = {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    vertical: styles.vertical!,
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    horizontal: styles.horizontal!,
};

export declare namespace SplitView {
    export interface Props {
        orientation: Orientation;
        className?: string;
        disabled?: boolean;
    }
}

export const SplitView: React.FC<React.PropsWithChildren<SplitView.Props>> = ({
    children,
    orientation,
    disabled = false,
    className,
}) => {
    const { dimensions, setRef, resizeSensorCallback } = useDimensions();

    const containerSizeInPixels = useMemo(
        () => (dimensions != null ? getRelevationDimensionForOrientation(dimensions, orientation) : undefined),
        [dimensions, orientation]
    );

    const contextValue = useCallback(
        (): SingleSplitViewContextValue => ({
            containerSizeInPixels,
            orientation,
            disabled,
        }),
        [containerSizeInPixels, disabled, orientation]
    );

    return (
        <ResizeSensor onResize={resizeSensorCallback}>
            <div ref={setRef} className={classNames(styles.container, CONTAINER_CLASS_NAME[orientation], className)}>
                <SingleSplitViewContext.Provider value={contextValue}>
                    {containerSizeInPixels != null && children}
                </SingleSplitViewContext.Provider>
            </div>
        </ResizeSensor>
    );
};
