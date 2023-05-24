import React from "react";

export const ApiPageContext = React.createContext<() => ApiPageContextValue>(() => {
    throw new Error("ApiPageContextProvider not found in tree.");
});

export interface ApiPageContextValue {
    containerRef: HTMLElement | undefined;
}
