import { assertNever } from "@fern-api/core-utils";
import { useCallback, useEffect, useReducer } from "react";

export declare namespace useTypeReferenceMouseDownState {
    export interface Args {
        isParentSelected: boolean;
    }

    export interface Return {
        isMouseDown: boolean;
        didMouseDownWhileSelected: boolean;
        onMouseDown: () => void;
    }
}

export function useTypeReferenceMouseDownState({
    isParentSelected,
}: useTypeReferenceMouseDownState.Args): useTypeReferenceMouseDownState.Return {
    const [state, dispatch] = useReducer(
        (_state: State, action: "onmouseup" | "onmousedown") => {
            switch (action) {
                case "onmouseup":
                    return {
                        isMouseDown: false,
                        didMouseDownWhileSelected: false,
                    };
                case "onmousedown":
                    return {
                        isMouseDown: true,
                        didMouseDownWhileSelected: isParentSelected,
                    };
                default:
                    assertNever(action);
            }
        },
        {
            isMouseDown: false,
            didMouseDownWhileSelected: false,
        }
    );

    useEffect(() => {
        const onMouseUp = () => {
            dispatch("onmouseup");
        };
        document.addEventListener("mouseup", onMouseUp);
        return () => {
            document.removeEventListener("mouseup", onMouseUp);
        };
    }, []);

    return {
        isMouseDown: state.isMouseDown,
        didMouseDownWhileSelected: state.didMouseDownWhileSelected,
        onMouseDown: useCallback(() => {
            dispatch("onmousedown");
        }, []),
    };
}

interface State {
    isMouseDown: boolean;
    didMouseDownWhileSelected: boolean;
}
