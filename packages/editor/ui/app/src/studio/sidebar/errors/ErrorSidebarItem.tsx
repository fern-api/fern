import { TransactionGenerator } from "@fern-api/transaction-generator";
import { FernApiEditor } from "@fern-fern/api-editor-sdk";
import { useCallback, useMemo } from "react";
import { useApiEditorContext } from "../../../api-editor-context/ApiEditorContext";
import { useError } from "../context/useError";
import { SidebarIcon } from "../icons/SidebarIcon";
import { SidebarItemIdGenerator } from "../ids/SidebarItemIdGenerator";
import { SelectableSidebarItemRow } from "../items/SelectableSidebarItemRow";

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

    const sidebarItemId = useMemo(() => SidebarItemIdGenerator.error(error), [error]);

    return (
        <SelectableSidebarItemRow
            itemId={sidebarItemId}
            label={error.errorName}
            icon={SidebarIcon.ERROR(error)}
            onDelete={onClickDelete}
            onRename={onRename}
        />
    );
};
