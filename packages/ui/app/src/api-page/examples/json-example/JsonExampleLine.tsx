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
                "w-fit min-w-full px-2 transition",
                isSelected ? "bg-accentHighlight" : "bg-transparent"
            )}
            ref={ref}
        >
            {" ".repeat(depth * TAB_WIDTH)}
            {children}
        </div>
    );
});
