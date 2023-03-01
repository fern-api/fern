import { useBooleanState } from "@fern-api/react-commons";
import React, { useMemo } from "react";

export const SplitViewContext = React.createContext<SplitViewContextValue | undefined>(undefined);

interface SplitViewContextValue {
    isResizing: boolean;
    onStartResizing: () => void;
    onStopResizing: () => void;
}

export const SplitViewProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
    const { value: isResizing, setTrue: onStartResizing, setFalse: onStopResizing } = useBooleanState(false);

    const value = useMemo(
        (): SplitViewContextValue => ({
            isResizing,
            onStartResizing,
            onStopResizing,
        }),
        [isResizing, onStartResizing, onStopResizing]
    );

    return <SplitViewContext.Provider value={value}>{children}</SplitViewContext.Provider>;
};
