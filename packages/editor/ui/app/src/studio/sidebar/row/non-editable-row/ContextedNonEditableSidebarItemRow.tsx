import { PREVENT_DEFAULT } from "@fern-api/react-commons";
import React from "react";
import { BaseSidebarItemRow } from "../base-row/BaseSidebarItemRow";
import { SidebarItemLabel } from "../label/SidebarItemLabel";

export declare namespace ContextedNonEditableSidebarItemRow {
    export interface Props extends BaseSidebarItemRow.ExternalProps {
        label: string;
    }
}

export const ContextedNonEditableSidebarItemRow: React.FC<ContextedNonEditableSidebarItemRow.Props> = ({
    label,
    ...baseRowProps
}) => {
    return (
        <BaseSidebarItemRow
            {...baseRowProps}
            label={<SidebarItemLabel label={label} />}
            onContextMenu={PREVENT_DEFAULT}
        />
    );
};
