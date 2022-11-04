import { assertNever } from "@fern-api/core-utils";
import produce from "immer";
import { useCallback, useEffect, useReducer } from "react";

export interface LocalLabel {
    value: string;
    set: (newLabel: string) => void;
    shouldRenderEditableText: boolean;
    isRenaming: boolean;
    onStartRenaming: () => void;
    onCancelRename: () => void;
    onConfirmRename: (newLabel: string) => void;
}

export declare namespace useLocalLabel {
    export interface Args {
        label: string;
        forceIsRenaming: boolean;
        onRename?: (newName: string) => void;
        onCancelRename?: () => void;
    }
}

export function useLocalLabel({ label, forceIsRenaming, onRename, onCancelRename }: useLocalLabel.Args): LocalLabel {
    const reducer = (state: State, action: Action): State => {
        switch (action.type) {
            case "setValue":
                return produce(state, (draft) => {
                    draft.value = action.value;
                });
            case "startRenaming":
                return produce(state, (draft) => {
                    draft.isRenaming = true;
                    draft.shouldRenderEditableText = true;
                });
            case "confirmRename":
                return produce(state, (draft) => {
                    draft.value = action.value;
                    draft.isRenaming = false;
                    draft.shouldRenderEditableText = action.value.length === 0;
                });
            case "cancelRename":
                return reducer(state, {
                    type: "confirmRename",
                    value: label,
                });
            default:
                assertNever(action);
        }
    };

    const [state, dispatch] = useReducer(reducer, {
        value: label,
        isRenaming: false,
        shouldRenderEditableText: false,
    });

    useEffect(() => {
        if (!state.isRenaming) {
            dispatch({
                type: "setValue",
                value: label,
            });
        }
    }, [state.isRenaming, label]);

    const handleCancelRename = useCallback(() => {
        dispatch({ type: "cancelRename" });
        onCancelRename?.();
    }, [onCancelRename]);

    const handleConfirmRename = useCallback(
        (value: string) => {
            dispatch({ type: "confirmRename", value });
            onRename?.(value);
        },
        [onRename]
    );

    return {
        value: state.value,
        set: useCallback((value: string) => {
            dispatch({ type: "setValue", value });
        }, []),
        shouldRenderEditableText: state.shouldRenderEditableText || forceIsRenaming,
        isRenaming: state.isRenaming || forceIsRenaming,
        onStartRenaming: useCallback(() => {
            dispatch({ type: "startRenaming" });
        }, []),
        onCancelRename: handleCancelRename,
        onConfirmRename: handleConfirmRename,
    };
}

interface State {
    value: string;
    isRenaming: boolean;
    shouldRenderEditableText: boolean;
}

type Action = SetValueAction | StartRenamingAction | ConfirmRenameAction | CancelRenameAction;

interface SetValueAction {
    type: "setValue";
    value: string;
}

interface StartRenamingAction {
    type: "startRenaming";
}

interface ConfirmRenameAction {
    type: "confirmRename";
    value: string;
}

interface CancelRenameAction {
    type: "cancelRename";
}
