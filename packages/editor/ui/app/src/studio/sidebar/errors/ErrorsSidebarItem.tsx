import { FernApiEditor } from "@fern-fern/api-editor-sdk";
import React, { useCallback, useMemo } from "react";
import { SidebarItemIdGenerator } from "../ids/SidebarItemIdGenerator";
import { CollapsibleSidebarItemRow } from "../row/collapsible/CollapsibleSidebarItemRow";
import { NonEditableSidebarItemRow } from "../row/non-editable-row/NonEditableSidebarItemRow";
import { useCreateErrorCallback } from "./useCreateErrorCallback";

export declare namespace ErrorsSidebarItem {
    export interface Props {
        package_: FernApiEditor.Package;
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

    return (
        <CollapsibleSidebarItemRow
            itemId={sidebarItemId}
            defaultIsCollapsed={package_.errors.length > 0}
            renderRow={renderRow}
        >
            {children}
        </CollapsibleSidebarItemRow>
    );
};
