import { useCallback, useState } from "react";

export declare namespace useBooleanState {
    export interface Return {
        value: boolean;
        setValue: (value: boolean) => void;
        toggleValue: () => void;
        setTrue: () => void;
        setFalse: () => void;
    }
}

export function useBooleanState(initialValue: boolean): useBooleanState.Return {
    const [value, setValue] = useState(initialValue);
    return {
        value,
        setValue,
        toggleValue: useCallback(() => setValue((existing) => !existing), []),
        setTrue: useCallback(() => setValue(true), []),
        setFalse: useCallback(() => setValue(false), []),
    };
}
