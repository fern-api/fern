import React, { useCallback, useMemo } from "react";
import { MaybeDraftPackage } from "../drafts/DraftableItem";
import { SidebarItemIdGenerator } from "../ids/SidebarItemIdGenerator";
import { CollapsibleSidebarItemRow } from "../row/collapsible/CollapsibleSidebarItemRow";
import { NonEditableSidebarItemRow } from "../row/non-editable-row/NonEditableSidebarItemRow";
import { shouldSectionBeDefaultCollapsed } from "../shared/shouldSectionBeDefaultCollapsed";
import { useCreateTypeCallback } from "./useCreateTypeCallback";

export declare namespace TypesSidebarItem {
    export interface Props {
        package_: MaybeDraftPackage;
        children: CollapsibleSidebarItemRow.Props["children"];
    }
}

export const TypesSidebarItem: React.FC<TypesSidebarItem.Props> = ({ package_, children }) => {
    const sidebarItemId = useMemo(() => SidebarItemIdGenerator.types(package_), [package_]);
    const onClickAdd = useCreateTypeCallback({ package_ });

    const renderRow = useCallback(
        ({ leftElement }: { leftElement: JSX.Element }) => {
            return (
                <NonEditableSidebarItemRow
                    itemId={sidebarItemId}
                    label="Types"
                    leftElement={leftElement}
                    onClickAdd={onClickAdd}
                />
            );
        },
        [onClickAdd, sidebarItemId]
    );

    const defaultIsCollapsed = useMemo(
        () => shouldSectionBeDefaultCollapsed({ parent: package_, getItems: (p) => p.types }),
        [package_]
    );

    return (
        <CollapsibleSidebarItemRow itemId={sidebarItemId} defaultIsCollapsed={defaultIsCollapsed} renderRow={renderRow}>
            {children}
        </CollapsibleSidebarItemRow>
    );
};
