import React from "react";
import { BaseSidebarItemRow } from "./BaseSidebarItemRow";

export declare namespace DraftSidebarItemRow {
    export interface Props extends Pick<BaseSidebarItemRow.Props, "icon"> {
        onConfirmName: (name: string) => void;
        onCancel: () => void;
    }
}

export const DraftSidebarItemRow: React.FC<DraftSidebarItemRow.Props> = ({ onConfirmName, onCancel, ...rowProps }) => {
    return (
        <BaseSidebarItemRow
            {...rowProps}
            label={undefined}
            isSelected={false}
            onRename={onConfirmName}
            onCancelRename={onCancel}
        />
    );
};
