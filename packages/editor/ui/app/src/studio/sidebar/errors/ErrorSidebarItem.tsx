import { Intent, Tag } from "@blueprintjs/core";
import { TransactionGenerator } from "@fern-api/transaction-generator";
import { FernApiEditor } from "@fern-fern/api-editor-sdk";
import { useCallback } from "react";
import { useApiEditorContext } from "../../../api-editor-context/ApiEditorContext";
import { useError } from "../context/useError";
import { SidebarItemIdGenerator } from "../ids/SidebarItemIdGenerator";
import { SidebarItemRow } from "../items/SidebarItemRow";
import styles from "./ErrorSidebarItem.module.scss";

export declare namespace ErrorSidebarItem {
    export interface Props {
        errorId: FernApiEditor.ErrorId;
    }
}

export const ErrorSidebarItem: React.FC<ErrorSidebarItem.Props> = ({ errorId }) => {
    const { submitTransaction } = useApiEditorContext();
    const error = useError(errorId);

    const onClickDelete = useCallback(() => {
        submitTransaction(
            TransactionGenerator.deleteError({
                errorId,
            })
        );
    }, [submitTransaction, errorId]);

    const onRename = useCallback(
        (newErrorName: string) => {
            submitTransaction(
                TransactionGenerator.renameError({
                    errorId,
                    newErrorName,
                })
            );
        },
        [submitTransaction, errorId]
    );

    return (
        <SidebarItemRow
            itemId={SidebarItemIdGenerator.error(errorId)}
            label={error.errorName}
            icon={
                <Tag className={styles.tag} intent={Intent.DANGER} minimal>
                    {error.statusCode}
                </Tag>
            }
            onDelete={onClickDelete}
            onRename={onRename}
        />
    );
};
