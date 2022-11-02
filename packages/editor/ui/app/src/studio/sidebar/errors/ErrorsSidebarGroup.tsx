import { EditorItemIdGenerator } from "@fern-api/editor-item-id-generator";
import { TransactionGenerator } from "@fern-api/transaction-generator";
import { FernApiEditor } from "@fern-fern/api-editor-sdk";
import React, { useCallback } from "react";
import { useApiEditorContext } from "../../../api-editor-context/ApiEditorContext";
import { SidebarItemIdGenerator } from "../ids/SidebarItemIdGenerator";
import { CollapsibleSidebarItemRow } from "../items/CollapsibleSidebarItemRow";
import { ErrorSidebarItem } from "./ErrorSidebarItem";

export declare namespace ErrorsSidebarGroup {
    export interface Props {
        package_: FernApiEditor.Package;
    }
}

export const ErrorsSidebarGroup: React.FC<ErrorsSidebarGroup.Props> = ({ package_ }) => {
    const { submitTransaction } = useApiEditorContext();

    const onClickAdd = useCallback(() => {
        submitTransaction(
            TransactionGenerator.createError({
                parent: package_.packageId,
                errorId: EditorItemIdGenerator.error(),
                errorName: "My new error",
            })
        );
    }, [package_.packageId, submitTransaction]);

    return (
        <CollapsibleSidebarItemRow
            itemId={SidebarItemIdGenerator.errors(package_.packageId)}
            label="Errors"
            onClickAdd={onClickAdd}
            defaultIsCollapsed={true}
        >
            {package_.errors.map((errorId) => (
                <ErrorSidebarItem key={errorId} errorId={errorId} />
            ))}
        </CollapsibleSidebarItemRow>
    );
};
