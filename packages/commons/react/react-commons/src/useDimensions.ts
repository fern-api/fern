import { useCallback, useRef, useState } from "react";

export interface Dimensions {
    height: number;
    width: number;
}

export declare namespace useDimensions {
    export interface Return {
        setRef: (ref: HTMLElement | null) => void;
        dimensions: Dimensions | undefined;
        resizeSensorCallback: () => void;
    }
}

export function useDimensions(): useDimensions.Return {
    const element = useRef<HTMLElement | null>(null);
    const [dimensions, setDimensions] = useState<Dimensions>();

    const updateDimensions = useCallback(() => {
        if (element.current != null) {
            const { width, height } = element.current.getBoundingClientRect();
            setDimensions({
                width,
                height,
            });
        }
    }, []);

    const setRef = useCallback(
        (ref: HTMLElement | null) => {
            if (ref != null) {
                element.current = ref;
                updateDimensions();
            }
        },
        [updateDimensions]
    );

    return {
        setRef,
        dimensions,
        resizeSensorCallback: updateDimensions,
    };
}
