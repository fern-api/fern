import React from "react";
import { LightweightPackage } from "../../../mock-backend/MockBackend";
import { CollapsibleSidebarItemRow } from "../items/CollapsibleSidebarItemRow";
import { ErrorSidebarItem } from "./ErrorSidebarItem";

export declare namespace ErrorsSidebarGroup {
    export interface Props {
        lightweightPackage: LightweightPackage;
    }
}

export const ErrorsSidebarGroup: React.FC<ErrorsSidebarGroup.Props> = ({ lightweightPackage }) => {
    return (
        <CollapsibleSidebarItemRow
            itemId={`${lightweightPackage.packageId}:errors`}
            label="Errors"
            onClickAdd={() => {
                // TODO
            }}
            defaultIsCollapsed={true}
        >
            {lightweightPackage.errors.map((error) => (
                <ErrorSidebarItem key={error.errorId} error={error} />
            ))}
        </CollapsibleSidebarItemRow>
    );
};
