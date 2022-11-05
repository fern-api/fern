import React from "react";
import { SidebarItemId } from "../../ids/SidebarItemId";
import { SidebarItemRowContextProvider } from "../context/SidebarItemRowContextProvider";
import { ContextedEditableSidebarItemRow } from "./ContextedEditableSidebarItemRow";

export declare namespace EditableSidebarItemRow {
    export interface Props extends ContextedEditableSidebarItemRow.Props {
        itemId: SidebarItemId;
    }
}

export const EditableSidebarItemRow: React.FC<EditableSidebarItemRow.Props> = ({ itemId, ...props }) => {
    return (
        <SidebarItemRowContextProvider itemId={itemId}>
            <ContextedEditableSidebarItemRow {...props} />
        </SidebarItemRowContextProvider>
    );
};
