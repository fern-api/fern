import { FernApiEditor } from "@fern-fern/api-editor-sdk";
import React, { useCallback, useMemo } from "react";
import { SidebarItemIdGenerator } from "../ids/SidebarItemIdGenerator";
import { CollapsibleSidebarItemRow } from "../row/collapsible/CollapsibleSidebarItemRow";
import { NonEditableSidebarItemRow } from "../row/non-editable-row/NonEditableSidebarItemRow";
import { useCreateTypeCallback } from "./useCreateTypeCallback";

export declare namespace TypesSidebarItem {
    export interface Props {
        package_: FernApiEditor.Package;
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

    return (
        <CollapsibleSidebarItemRow
            itemId={sidebarItemId}
            defaultIsCollapsed={package_.types.length > 0}
            renderRow={renderRow}
        >
            {children}
        </CollapsibleSidebarItemRow>
    );
};
