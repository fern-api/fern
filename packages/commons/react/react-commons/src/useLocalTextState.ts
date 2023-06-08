"use client";

import { EditableTextProps } from "@blueprintjs/core";
import { assertNever } from "@fern-api/core-utils";
import produce from "immer";
import { useCallback, useReducer } from "react";

export type LocalTextState = Required<
    Pick<
        EditableTextProps,
        "value" | "onChange" | "isEditing" | "onEdit" | "onCancel" | "onConfirm" | "selectAllOnFocus"
    >
>;

export declare namespace useLocalTextState {
    export interface Args {
        persistedValue: string;
        defaultIsRenaming?: boolean;
        onRename?: (newName: string) => void;
        onCancelRename?: () => void;
    }
}

export function useLocalTextState({
    persistedValue,
    defaultIsRenaming = false,
    onRename,
    onCancelRename,
}: useLocalTextState.Args): LocalTextState {
    const reducer = (state: State, action: Action): State => {
        switch (action.type) {
            case "setValue":
                return produce(state, (draft) => {
                    draft.value = action.value;
                });
            case "startRenaming":
                return produce(state, (draft) => {
                    draft.isRenaming = true;
                });
            case "confirmRename":
                return produce(state, (draft) => {
                    draft.value = action.value;
                    draft.isRenaming = false;
                });
            case "cancelRename":
                return reducer(state, {
                    type: "confirmRename",
                    value: persistedValue,
                });
            default:
                assertNever(action);
        }
    };

    const [state, dispatch] = useReducer(reducer, {
        value: persistedValue,
        isRenaming: defaultIsRenaming,
    });

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
        onChange: useCallback((value: string) => {
            dispatch({ type: "setValue", value });
        }, []),
        isEditing: state.isRenaming,
        onEdit: useCallback(() => {
            dispatch({ type: "startRenaming" });
        }, []),
        onCancel: handleCancelRename,
        onConfirm: handleConfirmRename,
        selectAllOnFocus: true,
    };
}

interface State {
    value: string;
    isRenaming: boolean;
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
