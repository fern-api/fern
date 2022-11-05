import { useCallback, useState } from "react";

export declare namespace useNumericState {
    export interface Return {
        value: number;
        setValue: (value: number) => void;
        increment: () => void;
        decrement: () => void;
    }
}

export function useNumericState(initialValue: number): useNumericState.Return {
    const [value, setValue] = useState(initialValue);
    return {
        value,
        setValue,
        increment: useCallback(() => setValue((previous) => previous + 1), []),
        decrement: useCallback(() => setValue((previous) => previous - 1), []),
    };
}
