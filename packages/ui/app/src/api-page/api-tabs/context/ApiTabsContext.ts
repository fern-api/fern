import React from "react";

export const ApiTabsContext = React.createContext<() => ApiTabsContextValue>(() => {
    throw new Error("ApiTabsContextProvider is not present in this tree.");
});

export interface ApiTabsContextValue {
    tabs: Tab[];
    openTab: (path: string) => void;
    closeTab: (index: number) => void;
    makeTabLongLived: (path: string) => void;
}

export interface Tab {
    path: string;
    isSelected: boolean;
    isEphemeral: boolean;
}
