import React from "react";
import { SidebarItemId } from "../../ids/SidebarItemId";
import { SidebarItemRowContextProvider } from "../context/SidebarItemRowContextProvider";
import { ContextedNonEditableSidebarItemRow } from "./ContextedNonEditableSidebarItemRow";

export declare namespace NonEditableSidebarItemRow {
    export interface Props extends ContextedNonEditableSidebarItemRow.Props {
        itemId: SidebarItemId;
    }
}

export const NonEditableSidebarItemRow: React.FC<NonEditableSidebarItemRow.Props> = ({ itemId, ...props }) => {
    return (
        <SidebarItemRowContextProvider itemId={itemId}>
            <ContextedNonEditableSidebarItemRow {...props} />
        </SidebarItemRowContextProvider>
    );
};
