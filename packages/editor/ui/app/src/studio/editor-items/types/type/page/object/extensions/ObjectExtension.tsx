import { TransactionGenerator } from "@fern-api/transaction-generator";
import { FernApiEditor } from "@fern-fern/api-editor-sdk";
import { useCallback } from "react";
import { useApiEditorContext } from "../../../../../../../api-editor-context/ApiEditorContext";
import { EditableItemRow } from "../../../../../shared/page/EditableItemRow";
import { EditableNamedTypeReference } from "../../../../../type-reference/named-type/EditableNamedTypeReference";

export declare namespace ObjectExtension {
    export interface Props {
        objectId: FernApiEditor.TypeId;
        extensionId: FernApiEditor.ObjectExtensionId;
        extensionOf: FernApiEditor.TypeId | undefined;
        isDraft: boolean;
        onDoneChangingType?: () => void;
    }
}

export const ObjectExtension: React.FC<ObjectExtension.Props> = ({
    objectId,
    extensionId,
    extensionOf,
    isDraft,
    onDoneChangingType,
}) => {
    const { submitTransaction } = useApiEditorContext();

    const onChangeExtensionType = useCallback(
        (extensionOf: FernApiEditor.TypeId) => {
            submitTransaction(
                isDraft
                    ? TransactionGenerator.createObjectExtension({
                          objectId,
                          extensionId,
                          extensionOf,
                      })
                    : TransactionGenerator.setObjectExtensionType({
                          objectId,
                          extensionId,
                          extensionOf,
                      })
            );
            onDoneChangingType?.();
        },
        [submitTransaction, isDraft, objectId, extensionId, onDoneChangingType]
    );

    const onClickDelete = useCallback(() => {
        submitTransaction(
            TransactionGenerator.deleteObjectExtension({
                objectId,
                extensionId,
            })
        );
    }, [submitTransaction, objectId, extensionId]);

    return (
        <EditableItemRow
            leftContent={
                <EditableNamedTypeReference
                    typeId={extensionOf}
                    onChange={onChangeExtensionType}
                    onClickCancel={onDoneChangingType}
                />
            }
            onDelete={onClickDelete}
        />
    );
};
