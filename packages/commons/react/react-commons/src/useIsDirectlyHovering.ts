import { assertNever } from "@fern-api/core-utils";
import React, { useCallback, useReducer } from "react";

export declare namespace useIsDirectlyHovering {
    export interface Return {
        isHovering: boolean;
        onMouseOver: (event: React.MouseEvent) => void;
        onMouseOut: () => void;
        onMouseMove: () => void;
    }
}

export function useIsDirectlyHovering(): useIsDirectlyHovering.Return {
    const [state, dispatch] = useReducer(
        (previousState: "inside" | "outside" | "hovering", action: "mouseover" | "mouseout" | "mousemove") => {
            switch (action) {
                case "mouseover":
                    return previousState === "hovering" ? previousState : "inside";
                case "mouseout":
                    return "outside";
                case "mousemove":
                    return previousState === "inside" ? "hovering" : previousState;
                default:
                    assertNever(action);
            }
        },
        "outside"
    );

    return {
        isHovering: state === "hovering",
        onMouseOver: useCallback((event: React.MouseEvent) => {
            dispatch("mouseover");
            event.stopPropagation();
        }, []),
        onMouseOut: useCallback(() => {
            dispatch("mouseout");
        }, []),
        onMouseMove: useCallback(() => {
            dispatch("mousemove");
        }, []),
    };
}
