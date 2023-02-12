import React, { useCallback, useState } from "react";
import { ApiContext, ApiContextValue, SidebarItemId } from "./ApiContext";

export const ApiContextProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
    const [focusedSidebarItem, setFocusedSidebarItem] = useState<SidebarItemId>();

    const setIsSidebarItemFocused = useCallback((sidebarItemid: SidebarItemId, isVisible: boolean) => {
        if (isVisible) {
            setFocusedSidebarItem(sidebarItemid);
        }
    }, []);

    const contextValue = useCallback(
        (): ApiContextValue => ({
            focusedSidebarItem,
            setIsSidebarItemFocused,
        }),
        [focusedSidebarItem, setIsSidebarItemFocused]
    );

    return <ApiContext.Provider value={contextValue}>{children}</ApiContext.Provider>;
};
