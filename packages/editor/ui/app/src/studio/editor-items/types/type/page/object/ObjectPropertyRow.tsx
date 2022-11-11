import { TransactionGenerator } from "@fern-api/transaction-generator";
import { FernApiEditor } from "@fern-fern/api-editor-sdk";
import { useCallback } from "react";
import { useApiEditorContext } from "../../../../../../api-editor-context/ApiEditorContext";
import { ObjectPropertyName } from "./ObjectPropertyName";

export declare namespace ObjectPropertyRow {
    export interface Props {
        objectId: FernApiEditor.TypeId;
        property: FernApiEditor.ObjectProperty;
        isDraft: boolean;
        onStopRenaming?: () => void;
    }
}

export const ObjectPropertyRow: React.FC<ObjectPropertyRow.Props> = ({
    objectId,
    property,
    isDraft,
    onStopRenaming,
}) => {
    const { submitTransaction } = useApiEditorContext();

    const onRename = useCallback(
        (newPropertyName: string) => {
            const transaction = isDraft
                ? TransactionGenerator.createObjectProperty({
                      objectId,
                      propertyId: property.propertyId,
                      propertyName: newPropertyName,
                      propertyType: property.propertyType,
                  })
                : TransactionGenerator.setObjectPropertyName({
                      objectId,
                      propertyId: property.propertyId,
                      newPropertyName,
                  });
            submitTransaction(transaction);
            onStopRenaming?.();
        },
        [isDraft, objectId, onStopRenaming, property.propertyId, property.propertyType, submitTransaction]
    );

    return (
        <div>
            <ObjectPropertyName property={property} isDraft={isDraft} onConfirm={onRename} onCancel={onStopRenaming} />
        </div>
    );
};
