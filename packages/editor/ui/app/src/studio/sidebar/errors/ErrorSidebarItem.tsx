import { Intent, Tag } from "@blueprintjs/core";
import { TransactionGenerator } from "@fern-api/transaction-generator";
import { FernApiEditor } from "@fern-fern/api-editor-sdk";
import { useMemo } from "react";
import { useError } from "../context/useError";
import { SidebarItemIdGenerator } from "../ids/SidebarItemIdGenerator";
import { SidebarItemRow } from "../row/SidebarItemRow";
import { useEditableSidebarItem } from "../shared/useEditableSidebarItem";
import styles from "./ErrorSidebarItem.module.scss";

export declare namespace ErrorSidebarItem {
    export interface Props {
        errorId: FernApiEditor.ErrorId;
        parent: FernApiEditor.PackageId;
    }
}

export const ErrorSidebarItem: React.FC<ErrorSidebarItem.Props> = ({ errorId, parent }) => {
    const error = useError(errorId);

    const { onDelete, onRename, isDraft } = useEditableSidebarItem({
        definitionId: errorId,
        parent,
        constructCreateTransaction,
        constructRenameTransaction,
        constructDeleteTransaction,
        isEqualToDraft,
    });

    const sidebarItemId = useMemo(() => SidebarItemIdGenerator.error(error), [error]);

    return (
        <SidebarItemRow
            itemId={sidebarItemId}
            label={error.errorName}
            icon={
                <Tag className={styles.tag} intent={Intent.DANGER} minimal>
                    {error.statusCode}
                </Tag>
            }
            onDelete={onDelete}
            onRename={onRename}
            isDraft={isDraft}
        />
    );
};

function constructCreateTransaction({
    name: errorName,
    parent,
    definitionId: errorId,
}: useEditableSidebarItem.constructCreateTransaction.Args<FernApiEditor.ErrorId>): FernApiEditor.transactions.Transaction.CreateError {
    return TransactionGenerator.createError({
        errorId,
        errorName,
        parent,
    });
}

function constructRenameTransaction({
    newName: newErrorName,
    definitionId: errorId,
}: useEditableSidebarItem.constructRenameTransaction.Args<FernApiEditor.ErrorId>): FernApiEditor.transactions.Transaction.RenameError {
    return TransactionGenerator.renameError({
        errorId,
        newErrorName,
    });
}

function constructDeleteTransaction({
    definitionId: errorId,
}: useEditableSidebarItem.constructDeleteTransaction.Args<FernApiEditor.ErrorId>): FernApiEditor.transactions.Transaction.DeleteError {
    return TransactionGenerator.deleteError({
        errorId,
    });
}

function isEqualToDraft({
    definitionId: errorId,
    draft,
}: useEditableSidebarItem.isEqualToDraft.Args<FernApiEditor.ErrorId>): boolean {
    return draft.type === "error" && draft.errorId === errorId;
}
