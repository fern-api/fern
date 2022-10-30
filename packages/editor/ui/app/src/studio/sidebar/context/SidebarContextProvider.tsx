import React, { useCallback, useState } from "react";
import { SidebarContext, SidebarContextValue, SidebarItemId, SidebarItemState } from "./SidebarContext";

export const SidebarContextProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
    const [states, setStates] = useState<Record<SidebarItemId, SidebarItemState>>({});
    const [selectedItem, setSelectedItem] = useState<SidebarItemId>();

    const setState = useCallback(
        (itemId: SidebarItemId, state: SidebarItemState) => {
            setStates({
                ...states,
                [itemId]: state,
            });
        },
        [states]
    );

    const value = useCallback((): SidebarContextValue => {
        return {
            selectedItem,
            setSelectedItem,
            states,
            setState,
        };
    }, [selectedItem, setState, states]);

    return <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>;
};
