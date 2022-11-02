import { Colors, Icon } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import { TransactionGenerator } from "@fern-api/transaction-generator";
import { FernApiEditor } from "@fern-fern/api-editor-sdk";
import { useCallback } from "react";
import { useApiEditorContext } from "../../../api-editor-context/ApiEditorContext";
import { useType } from "../context/useType";
import { SidebarItemIdGenerator } from "../ids/SidebarItemIdGenerator";
import { SidebarItemRow } from "../items/SidebarItemRow";

export declare namespace TypeSidebarItem {
    export interface Props {
        typeId: FernApiEditor.TypeId;
    }
}

export const TypeSidebarItem: React.FC<TypeSidebarItem.Props> = ({ typeId }) => {
    const { submitTransaction } = useApiEditorContext();
    const type = useType(typeId);

    const onClickDelete = useCallback(() => {
        submitTransaction(
            TransactionGenerator.deleteType({
                typeId,
            })
        );
    }, [submitTransaction, typeId]);

    const onRename = useCallback(
        (newTypeName: string) => {
            submitTransaction(
                TransactionGenerator.renameType({
                    typeId,
                    newTypeName,
                })
            );
        },
        [submitTransaction, typeId]
    );

    return (
        <SidebarItemRow
            itemId={SidebarItemIdGenerator.type(typeId)}
            label={type.typeName}
            icon={<Icon icon={IconNames.CUBE} color={Colors.TURQUOISE3} />}
            onDelete={onClickDelete}
            onRename={onRename}
        />
    );
};
