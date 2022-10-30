import { IconNames } from "@blueprintjs/icons";
import React from "react";
import { LightweightPackage } from "../../../mock-backend/MockBackend";
import { CollapsibleSidebarItemRow } from "../items/CollapsibleSidebarItemRow";

export declare namespace PackageSidebarItem {
    export interface Props {
        lightweightPackage: LightweightPackage;
        children: CollapsibleSidebarItemRow.Props["children"];
    }
}

export const PackageSidebarItem: React.FC<PackageSidebarItem.Props> = ({ lightweightPackage, children }) => {
    return (
        <CollapsibleSidebarItemRow
            itemId={lightweightPackage.packageId}
            label={lightweightPackage.name}
            icon={IconNames.BOX}
            onClickAdd={() => {
                // TODO
            }}
            defaultIsCollapsed={false}
        >
            {children}
        </CollapsibleSidebarItemRow>
    );
};
