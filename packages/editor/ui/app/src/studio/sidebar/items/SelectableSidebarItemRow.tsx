import React, { useCallback } from "react";
import { useSelectedSidebarItemId } from "../../routes/useSelectedSidebarItemId";
import { SidebarItemId } from "../ids/SidebarItemId";
import { StringifiedSidebarItemId } from "../ids/StringifiedSidebarItemId";
import { BaseSidebarItemRow } from "./BaseSidebarItemRow";

export declare namespace SelectableSidebarItemRow {
    export interface Props extends Omit<BaseSidebarItemRow.Props, "isSelected" | "onClick"> {
        itemId: SidebarItemId;
    }
}

export const SelectableSidebarItemRow: React.FC<SelectableSidebarItemRow.Props> = ({ itemId, ...rowProps }) => {
    const [selectedSidebarItemId, setSelectedSidebarItemId] = useSelectedSidebarItemId();

    const onClick = useCallback(() => {
        setSelectedSidebarItemId(itemId);
    }, [itemId, setSelectedSidebarItemId]);

    const isSelected =
        selectedSidebarItemId != null &&
        StringifiedSidebarItemId.stringify(selectedSidebarItemId) === StringifiedSidebarItemId.stringify(itemId);

    return <BaseSidebarItemRow {...rowProps} isSelected={isSelected} onClick={onClick} />;
};
