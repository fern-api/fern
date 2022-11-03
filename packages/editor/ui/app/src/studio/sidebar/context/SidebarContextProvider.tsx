import React, { useCallback, useState } from "react";
import { SidebarItemId } from "../ids/SidebarItemId";
import { StringifiedSidebarItemId } from "../ids/StringifiedSidebarItemId";
import { SidebarContext, SidebarContextValue, SidebarItemState } from "./SidebarContext";

export const SidebarContextProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
    const [states, setStates] = useState<Record<StringifiedSidebarItemId, SidebarItemState>>({});

    const setState = useCallback(
        (itemId: SidebarItemId, state: SidebarItemState) => {
            setStates({
                ...states,
                [StringifiedSidebarItemId.stringify(itemId)]: state,
            });
        },
        [states]
    );

    const value = useCallback((): SidebarContextValue => {
        return {
            states,
            setState,
        };
    }, [setState, states]);

    return <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>;
};
