import { assertNever } from "@fern-api/core-utils";
import { useCallback, useReducer } from "react";

export declare namespace useIsHovering {
    export interface Return {
        isHovering: boolean;
        onMouseOver: () => void;
        onMouseLeave: () => void;
        onMouseMove: () => void;
    }
}

export function useIsHovering(): useIsHovering.Return {
    const [state, dispatch] = useReducer(
        (previousState: "inside" | "outside" | "hovering", action: "mouseover" | "mouseleave" | "mousemove") => {
            switch (action) {
                case "mouseover":
                    return previousState === "hovering" ? previousState : "inside";
                case "mouseleave":
                    return "outside";
                case "mousemove":
                    return "hovering";
                default:
                    assertNever(action);
            }
        },
        "outside"
    );

    return {
        isHovering: state === "hovering",
        onMouseOver: useCallback(() => dispatch("mouseover"), []),
        onMouseLeave: useCallback(() => dispatch("mouseleave"), []),
        onMouseMove: useCallback(() => dispatch("mousemove"), []),
    };
}
