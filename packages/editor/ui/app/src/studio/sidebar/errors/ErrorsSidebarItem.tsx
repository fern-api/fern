import { EditorItemIdGenerator } from "@fern-api/editor-item-id-generator";
import { FernApiEditor } from "@fern-fern/api-editor-sdk";
import React, { useCallback, useMemo } from "react";
import { DraftErrorSidebarItemId } from "../context/SidebarContext";
import { SidebarItemIdGenerator } from "../ids/SidebarItemIdGenerator";
import { CollapsibleSidebarItemRow } from "../row/CollapsibleSidebarItemRow";
import { useAddDraft } from "../shared/useAddDraft";

export declare namespace ErrorsSidebarItem {
    export interface Props {
        package_: FernApiEditor.Package;
        children: CollapsibleSidebarItemRow.Props["children"];
    }
}

export const ErrorsSidebarItem: React.FC<ErrorsSidebarItem.Props> = ({ package_, children }) => {
    const sidebarItemId = useMemo(() => SidebarItemIdGenerator.errors(package_), [package_]);

    const createDraft = useCallback((): DraftErrorSidebarItemId => {
        return {
            type: "error",
            parent: package_.packageId,
            errorId: EditorItemIdGenerator.error(),
        };
    }, [package_.packageId]);

    const { onClickAdd } = useAddDraft({
        sidebarItemId,
        createDraft,
    });

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
