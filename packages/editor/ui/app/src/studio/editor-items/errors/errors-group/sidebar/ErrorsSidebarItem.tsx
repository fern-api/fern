import React, { useCallback, useMemo } from "react";
import { MaybeDraftPackage } from "../../../../sidebar/drafts/DraftableItem";
import { SidebarItemIdGenerator } from "../../../../sidebar/ids/SidebarItemIdGenerator";
import { CollapsibleSidebarItemRow } from "../../../../sidebar/row/collapsible/CollapsibleSidebarItemRow";
import { NonEditableSidebarItemRow } from "../../../../sidebar/row/non-editable-row/NonEditableSidebarItemRow";
import { shouldSectionBeDefaultCollapsed } from "../../../shared/sidebar/shouldSectionBeDefaultCollapsed";
import { useCreateErrorCallback } from "./useCreateErrorCallback";

export declare namespace ErrorsSidebarItem {
    export interface Props {
        package_: MaybeDraftPackage;
        children: CollapsibleSidebarItemRow.Props["children"];
    }
}

export const ErrorsSidebarItem: React.FC<ErrorsSidebarItem.Props> = ({ package_, children }) => {
    const sidebarItemId = useMemo(() => SidebarItemIdGenerator.errors(package_), [package_]);
    const onClickAdd = useCreateErrorCallback({ package_ });

    const renderRow = useCallback(
        ({ leftElement }: { leftElement: JSX.Element }) => {
            return (
                <NonEditableSidebarItemRow
                    itemId={sidebarItemId}
                    label="Errors"
                    leftElement={leftElement}
                    onClickAdd={onClickAdd}
                />
            );
        },
        [onClickAdd, sidebarItemId]
    );

    const defaultIsCollapsed = useMemo(
        () => shouldSectionBeDefaultCollapsed({ parent: package_, getItems: (p) => p.errors }),
        [package_]
    );

    return (
        <CollapsibleSidebarItemRow itemId={sidebarItemId} defaultIsCollapsed={defaultIsCollapsed} renderRow={renderRow}>
            {children}
        </CollapsibleSidebarItemRow>
    );
};
