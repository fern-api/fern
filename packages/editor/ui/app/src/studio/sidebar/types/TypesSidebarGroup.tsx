import { EditorItemIdGenerator } from "@fern-api/editor-item-id-generator";
import { TransactionGenerator } from "@fern-api/transaction-generator";
import { FernApiEditor } from "@fern-fern/api-editor-sdk";
import React, { useCallback, useMemo } from "react";
import { useApiEditorContext } from "../../../api-editor-context/ApiEditorContext";
import { useSidebarItemState } from "../context/useSidebarContext";
import { SidebarItemIdGenerator } from "../ids/SidebarItemIdGenerator";
import { CollapsibleSidebarItemRow } from "../items/CollapsibleSidebarItemRow";
import { TypeSidebarItem } from "./TypeSidebarItem";

export declare namespace TypesSidebarGroup {
    export interface Props {
        package_: FernApiEditor.Package;
    }
}

export const TypesSidebarGroup: React.FC<TypesSidebarGroup.Props> = ({ package_ }) => {
    const sidebarItemId = useMemo(() => SidebarItemIdGenerator.types(package_), [package_]);

    const [, setSidebarItemState] = useSidebarItemState(sidebarItemId);

    const { submitTransaction } = useApiEditorContext();

    const onClickAdd = useCallback(() => {
        submitTransaction(
            TransactionGenerator.createType({
                parent: package_.packageId,
                typeId: EditorItemIdGenerator.type(),
                typeName: "My new type",
            })
        );
        setSidebarItemState({
            isCollapsed: false,
        });
    }, [package_.packageId, setSidebarItemState, submitTransaction]);

    return (
        <CollapsibleSidebarItemRow
            itemId={sidebarItemId}
            label="Types"
            onClickAdd={onClickAdd}
            defaultIsCollapsed={true}
        >
            {package_.types.map((typeId) => (
                <TypeSidebarItem key={typeId} typeId={typeId} />
            ))}
        </CollapsibleSidebarItemRow>
    );
};
