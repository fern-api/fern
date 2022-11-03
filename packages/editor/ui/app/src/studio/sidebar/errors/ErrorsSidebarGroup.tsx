import { EditorItemIdGenerator } from "@fern-api/editor-item-id-generator";
import { TransactionGenerator } from "@fern-api/transaction-generator";
import { FernApiEditor } from "@fern-fern/api-editor-sdk";
import React, { useCallback, useMemo } from "react";
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

    const sidebarItemId = useMemo(() => SidebarItemIdGenerator.errors(package_), [package_]);

    return (
        <CollapsibleSidebarItemRow
            itemId={sidebarItemId}
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
