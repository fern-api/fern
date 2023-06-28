import classNames from "classnames";
import React, { PropsWithChildren, useContext } from "react";
import { JsonExampleDepthContext } from "./contexts/JsonExampleDepthContext";
import { JsonPropertySelectionContext } from "./contexts/JsonPropertySelectionContext";

const TAB_WIDTH = 2;

export const JsonExampleLine = React.forwardRef<HTMLDivElement, PropsWithChildren>(function JsonExampleLine(
    { children },
    ref
) {
    const { depth } = useContext(JsonExampleDepthContext);
    const { isSelected } = useContext(JsonPropertySelectionContext);

    return (
        <div
            className={classNames(
                "relative w-fit min-w-full px-4 transition py-px",
                isSelected ? "bg-accentPrimary/20" : "bg-transparent"
            )}
            ref={ref}
        >
            {isSelected && <div className="bg-accentPrimary absolute inset-y-0 left-0 w-1" />}
            {" ".repeat(depth * TAB_WIDTH)}
            {children}
        </div>
    );
});
