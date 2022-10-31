import { useCallback, useState } from "react";

export declare namespace useIsHovering {
    export interface Return {
        isHovering: boolean;
        onMouseEnter: () => void;
        onMouseLeave: () => void;
    }
}

export function useIsHovering(): useIsHovering.Return {
    const [isHovering, setIsHovering] = useState(false);
    const onMouseEnter = useCallback(() => setIsHovering(true), []);
    const onMouseLeave = useCallback(() => setIsHovering(false), []);
    return { isHovering, onMouseEnter, onMouseLeave };
}
