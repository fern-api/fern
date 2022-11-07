import React, { useCallback, useState } from "react";
import { DraftSidebarItemId } from "../drafts/DraftSidebarItemId";
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

    const [draft, setDraft] = useState<DraftSidebarItemId>();

    const value = useCallback((): SidebarContextValue => {
        return {
            states,
            setState,
            draft,
            setDraft,
        };
    }, [draft, setState, states]);

    return <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>;
};
