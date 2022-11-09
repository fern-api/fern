import React, { useCallback, useState } from "react";

export declare namespace useIsDirectlyHovering {
    export interface Return {
        isHovering: boolean;
        onMouseOver: (event: React.MouseEvent) => void;
        onMouseOut: () => void;
    }
}

export function useIsDirectlyHovering(): useIsDirectlyHovering.Return {
    const [isHovering, setIsHovering] = useState(false);
    return {
        isHovering,
        onMouseOver: useCallback((event: React.MouseEvent) => {
            setIsHovering(true);
            event.stopPropagation();
        }, []),
        onMouseOut: useCallback(() => {
            setIsHovering(false);
        }, []),
    };
}
