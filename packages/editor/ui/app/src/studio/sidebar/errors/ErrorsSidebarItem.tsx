import { EditorItemIdGenerator } from "@fern-api/editor-item-id-generator";
import { FernApiEditor } from "@fern-fern/api-editor-sdk";
import React, { useCallback, useMemo } from "react";
import { useSidebarContext, useSidebarItemState } from "../context/useSidebarContext";
import { SidebarItemIdGenerator } from "../ids/SidebarItemIdGenerator";
import { CollapsibleSidebarItemRow } from "../items/CollapsibleSidebarItemRow";

export declare namespace ErrorsSidebarItem {
    export interface Props {
        package_: FernApiEditor.Package;
        children: CollapsibleSidebarItemRow.Props["children"];
    }
}

export const ErrorsSidebarItem: React.FC<ErrorsSidebarItem.Props> = ({ package_, children }) => {
    const sidebarItemId = useMemo(() => SidebarItemIdGenerator.errors(package_), [package_]);
    const [, setSidebarItemState] = useSidebarItemState(sidebarItemId);
    const { setDraft } = useSidebarContext();

    const onClickAdd = useCallback(() => {
        setDraft({
            type: "error",
            parent: package_.packageId,
            errorId: EditorItemIdGenerator.error(),
        });
        setSidebarItemState({
            isCollapsed: false,
        });
    }, [package_.packageId, setDraft, setSidebarItemState]);

    return (
        <CollapsibleSidebarItemRow
            itemId={sidebarItemId}
            label="Errors"
            onClickAdd={onClickAdd}
            defaultIsCollapsed={true}
            isDraft={false}
        >
            {children}
        </CollapsibleSidebarItemRow>
    );
};
