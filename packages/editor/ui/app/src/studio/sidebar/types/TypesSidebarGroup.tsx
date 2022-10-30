import React from "react";
import { LightweightPackage } from "../../../mock-backend/MockBackend";
import { CollapsibleSidebarItemRow } from "../items/CollapsibleSidebarItemRow";
import { TypeSidebarItem } from "./TypeSidebarItem";

export declare namespace TypesSidebarGroup {
    export interface Props {
        lightweightPackage: LightweightPackage;
    }
}

export const TypesSidebarGroup: React.FC<TypesSidebarGroup.Props> = ({ lightweightPackage }) => {
    return (
        <CollapsibleSidebarItemRow
            itemId={`${lightweightPackage.packageId}:types`}
            label="Types"
            onClickAdd={() => {
                // TODO
            }}
            defaultIsCollapsed={true}
        >
            {lightweightPackage.types.map((type) => (
                <TypeSidebarItem key={type.typeId} type={type} />
            ))}
        </CollapsibleSidebarItemRow>
    );
};
